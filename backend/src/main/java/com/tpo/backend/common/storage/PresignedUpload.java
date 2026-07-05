package com.tpo.backend.common.storage;

/** Object key assigned within the bucket, plus the presigned PUT URL the phone uploads to. */
public record PresignedUpload(String key, String uploadUrl) {
}
