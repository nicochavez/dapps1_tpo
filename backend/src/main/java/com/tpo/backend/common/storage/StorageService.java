package com.tpo.backend.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.util.UUID;

/**
 * Presigned-URL gateway to the Railway Storage Bucket (S3-compatible, private). The backend
 * never touches image bytes: uploads go phone -> bucket via a presigned PUT, renders go
 * bucket -> app via a presigned GET derived from the stored object key.
 */
@Service
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner presigner;
    private final String bucket;
    private final long getTtlSeconds;
    private final long putTtlSeconds;

    public StorageService(@Value("${app.storage.bucket}") String bucket,
                          @Value("${app.storage.endpoint}") String endpoint,
                          @Value("${app.storage.region}") String region,
                          @Value("${app.storage.access-key}") String accessKey,
                          @Value("${app.storage.secret-key}") String secretKey,
                          @Value("${app.storage.get-ttl-seconds}") long getTtlSeconds,
                          @Value("${app.storage.put-ttl-seconds}") long putTtlSeconds) {
        this.bucket = bucket;
        this.getTtlSeconds = getTtlSeconds;
        this.putTtlSeconds = putTtlSeconds;

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

    /** Assigns a fresh object key and presigns a PUT for it. The content type is part of the
     *  signature, so the phone's PUT must send this exact Content-Type back. */
    public PresignedUpload presignPut(String contentType) {
        String key = "fotos/" + UUID.randomUUID() + ".jpg";
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(putTtlSeconds))
                .putObjectRequest(objectRequest)
                .build();
        return new PresignedUpload(key, presigner.presignPutObject(presignRequest).url().toString());
    }

    /** Presigned GET for rendering; derived fresh from the stored key on every DTO response. */
    public String presignGet(String key) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(getTtlSeconds))
                .getObjectRequest(objectRequest)
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }

    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
