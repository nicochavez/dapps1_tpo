package com.tpo.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Envía correos transaccionales a través de la API HTTP de Brevo (https://api.brevo.com).
 *
 * Se usa HTTP (puerto 443) en lugar de SMTP porque Railway bloquea el tráfico SMTP saliente
 * (puertos 25/465/587/2525) en el plan Hobby: por eso el envío por smtp.gmail.com:587 daba
 * timeout una vez deployado aunque anduviera en local. La API key y el remitente (que debe
 * estar verificado en Brevo como "single sender") se toman de variables de entorno.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;
    private final String apiKey;
    private final String from;
    private final String fromName;

    public EmailService(@Value("${app.mail.brevo.api-key:}") String apiKey,
                        @Value("${app.mail.from:}") String from,
                        @Value("${app.mail.from-name:BidFlow}") String fromName) {
        this.apiKey = apiKey;
        this.from = from;
        this.fromName = fromName;
        // RestClient.create() no depende del bean RestClient.Builder autoconfigurado
        // (que en Spring Boot 4 + starter-webmvc puede no estar presente).
        this.restClient = RestClient.create();
    }

    public void enviarAprobacion(String emailDestino, String nombre, String contraseniaTemporal) {
        String cuerpo = "Hola " + nombre + ",\n\n" +
                "Tu registro fue aprobado. Ya podés ingresar a BidFlow.\n\n" +
                "Tu contraseña temporal es: " + contraseniaTemporal + "\n\n" +
                "Te recomendamos cambiarla en tu primer inicio de sesión desde " +
                "POST /api/v1/auth/set-contrasenia.\n\n" +
                "Bienvenido/a!";

        enviar(emailDestino, "Tu cuenta en BidFlow fue aprobada", cuerpo, "aprobacion");
    }

    public void enviarNuevaContrasenia(String emailDestino, String nombre, String nuevaContrasenia) {
        String cuerpo = "Hola " + nombre + ",\n\n" +
                "Recibimos una solicitud para recuperar el acceso a tu cuenta de BidFlow.\n\n" +
                "Tu nueva contraseña temporal es: " + nuevaContrasenia + "\n\n" +
                "Ingresá con ella y cambiala cuanto antes desde tu perfil.\n\n" +
                "Si no solicitaste esto, contactá a soporte de inmediato.";

        enviar(emailDestino, "Recuperación de contraseña - BidFlow", cuerpo, "recuperacion de contrasenia");
    }

    public void enviarCambioClave(String emailDestino) {
        String cuerpo = "Tu contraseña ha sido cambiada con éxito.\n\n" +
                "Si no realizaste este cambio, contactá a soporte de inmediato.";

        enviar(emailDestino, "Tu contraseña fue cambiada", cuerpo, "cambio de clave");
    }

    private void enviar(String emailDestino, String asunto, String cuerpo, String tipo) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("[MAIL] app.mail.brevo.api-key no configurada; se omite el envío de {} a {}", tipo, emailDestino);
            return;
        }

        Map<String, Object> payload = Map.of(
                "sender", Map.of("email", from, "name", fromName),
                "to", List.of(Map.of("email", emailDestino)),
                "subject", asunto,
                "textContent", cuerpo);

        try {
            restClient.post()
                    .uri(BREVO_URL)
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.info("[MAIL] {} enviado a {}", tipo, emailDestino);
        } catch (Exception e) {
            log.error("[MAIL] Error al enviar {} a {}: {}", tipo, emailDestino, e.getMessage());
        }
    }
}
