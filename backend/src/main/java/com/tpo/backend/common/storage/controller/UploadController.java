package com.tpo.backend.common.storage.controller;

import com.tpo.backend.auth.security.AuthenticatedUser;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.common.storage.PresignedUpload;
import com.tpo.backend.common.storage.StorageService;
import com.tpo.backend.common.storage.dto.UploadPresignRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Presigned uploads to the Railway Storage Bucket; the phone PUTs bytes directly to the
 *  bucket afterwards, so this backend never sees image bytes. */
@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/presign")
    public ResponseEntity<PresignedUpload> presign(@AuthenticationPrincipal AuthenticatedUser me,
                                                    @Valid @RequestBody UploadPresignRequest request) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.ok(storageService.presignPut(request.getContentType()));
    }
}
