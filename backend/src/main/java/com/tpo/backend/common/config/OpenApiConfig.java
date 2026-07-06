package com.tpo.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Registra el esquema "Bearer JWT" en /v3/api-docs para que Swagger UI muestre
 * el boton "Authorize": logueate en POST /api/v1/auth/login, copia el "token"
 * de la respuesta y pegalo ahi (sin el prefijo "Bearer ", springdoc lo agrega).
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    /**
     * URL publica del backend usada como "server" en Swagger UI.
     * En Railway defini APP_PUBLIC_URL=https://tu-app.up.railway.app
     * Vacio (local) => springdoc usa la URL relativa de la request.
     */
    @Value("${app.public-url:}")
    private String publicUrl;

    @Bean
    public OpenAPI bidFlowOpenApi() {
        OpenAPI openApi = new OpenAPI()
                .info(new Info().title("BidFlow API").version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME,
                        new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));

        if (publicUrl != null && !publicUrl.isBlank()) {
            openApi.servers(List.of(new Server().url(publicUrl)));
        }
        return openApi;
    }
}
