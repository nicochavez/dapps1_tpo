package com.tpo.backend.common.storage;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gateway to the Railway Storage Bucket (S3-compatible, private). The mobile app sends
 * image bytes to the backend, which downsizes them and uploads them here; render URLs are
 * presigned GETs derived from the stored object key.
 *
 * Two latency mitigations for clients far from the bucket (US West ↔ Argentina):
 *  - {@link #upload} downscales/compresses images so each download is a fraction of the size.
 *  - {@link #presignGet} caches the presigned URL per key, so the URL string stays stable
 *    across responses and the client's image cache actually hits instead of re-downloading.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    /** Lado máximo (px) de la imagen almacenada; las fotos de celular llegan mucho más grandes. */
    private static final int MAX_DIMENSION = 1080;
    /** Calidad JPEG del reencode (0..1). 0.8 ≈ buena calidad con archivos ~5-10x más chicos. */
    private static final double JPEG_QUALITY = 0.8;
    /** Refrescar la URL cacheada cuando le quede menos de esto de vida. */
    private static final long URL_REFRESH_MARGIN_SECONDS = 3600;

    private final S3Client s3Client;
    private final S3Presigner presigner;
    private final String bucket;
    private final long getTtlSeconds;

    /** URL presignada por key, para no regenerar (y así invalidar la caché del cliente) en cada respuesta. */
    private final ConcurrentHashMap<String, CachedUrl> urlCache = new ConcurrentHashMap<>();

    private record CachedUrl(String url, Instant expiresAt) {}

    public StorageService(@Value("${app.storage.bucket}") String bucket,
                          @Value("${app.storage.endpoint}") String endpoint,
                          @Value("${app.storage.region}") String region,
                          @Value("${app.storage.access-key}") String accessKey,
                          @Value("${app.storage.secret-key}") String secretKey,
                          @Value("${app.storage.get-ttl-seconds}") long getTtlSeconds) {
        this.bucket = bucket;
        this.getTtlSeconds = getTtlSeconds;

        var credentials = StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
        var serviceConfiguration = S3Configuration.builder().pathStyleAccessEnabled(true).build();
        var endpointUri = URI.create(endpoint);
        var regionValue = Region.of(region);

        this.s3Client = S3Client.builder()
                .endpointOverride(endpointUri)
                .region(regionValue)
                .credentialsProvider(credentials)
                .serviceConfiguration(serviceConfiguration)
                .build();

        this.presigner = S3Presigner.builder()
                .endpointOverride(endpointUri)
                .region(regionValue)
                .credentialsProvider(credentials)
                .serviceConfiguration(serviceConfiguration)
                .build();
    }

    /**
     * Downscales/compresses the image and uploads it under a freshly assigned object key.
     * The stored object is always a JPEG. Returns the key.
     */
    public String upload(byte[] bytes, String contentType) {
        byte[] optimized = downscale(bytes);
        String key = "fotos/" + UUID.randomUUID() + ".jpg";
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("image/jpeg")
                .build();
        s3Client.putObject(objectRequest, RequestBody.fromBytes(optimized));
        return key;
    }

    /**
     * Presigned GET for rendering. Cached per key: the same URL string is reused until it
     * nears expiry, so the mobile client's image cache keys stay stable and hit on re-render
     * instead of re-downloading the same photo every response.
     */
    public String presignGet(String key) {
        // Las semillas de prueba pueden guardar en fotos.url una URL pública absoluta
        // (una imagen en internet) en lugar de un object key del bucket. En ese caso no
        // hay nada que presignar: se devuelve tal cual para que el cliente la cargue directo.
        if (key != null && (key.startsWith("http://") || key.startsWith("https://"))) {
            return key;
        }
        CachedUrl cached = urlCache.get(key);
        if (cached != null && cached.expiresAt().isAfter(Instant.now().plusSeconds(URL_REFRESH_MARGIN_SECONDS))) {
            return cached.url();
        }
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(getTtlSeconds))
                .getObjectRequest(objectRequest)
                .build();
        String url = presigner.presignGetObject(presignRequest).url().toString();
        urlCache.put(key, new CachedUrl(url, Instant.now().plusSeconds(getTtlSeconds)));
        return url;
    }

    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        urlCache.remove(key);
    }

    /**
     * Reencodes the image to JPEG, scaling it down so its longest side is at most
     * {@link #MAX_DIMENSION}. Never upscales. If the bytes can't be decoded as an image,
     * returns them unchanged so the upload still succeeds.
     */
    private byte[] downscale(byte[] original) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(original));
            if (image == null) {
                log.warn("No se pudo decodificar la imagen ({} bytes); se sube sin optimizar", original.length);
                return original;
            }
            int longest = Math.max(image.getWidth(), image.getHeight());
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            var builder = Thumbnails.of(image).outputFormat("jpg").outputQuality(JPEG_QUALITY);
            if (longest > MAX_DIMENSION) {
                builder.size(MAX_DIMENSION, MAX_DIMENSION).keepAspectRatio(true);
            } else {
                builder.scale(1.0); // ya es chica: solo recomprime, no agranda
            }
            builder.toOutputStream(out);
            return out.toByteArray();
        } catch (IOException | IllegalArgumentException e) {
            log.warn("Error optimizando la imagen; se sube sin optimizar", e);
            return original;
        }
    }
}
