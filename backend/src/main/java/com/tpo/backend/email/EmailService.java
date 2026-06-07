package com.tpo.backend.email;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final MailtrapClient client;

    public EmailService(@Value("${mailtrap.token}") String token) {
        MailtrapConfig config = new MailtrapConfig.Builder().token(token).build();
        this.client = MailtrapClientFactory.createMailtrapClient(config);
    }

    public void enviarAprobacion(String emailDestino, String nombre, String contraseniaTemporal) {
        MailtrapMail mail = MailtrapMail.builder()
                .from(new Address("hello@demomailtrap.co", "BidFlow"))
                .to(List.of(new Address(emailDestino)))
                .subject("Tu cuenta en BidFlow fue aprobada")
                .text("Hola " + nombre + ",\n\n" +
                      "Tu registro fue aprobado. Ya podés ingresar a BidFlow.\n\n" +
                      "Tu contraseña temporal es: " + contraseniaTemporal + "\n\n" +
                      "Te recomendamos cambiarla en tu primer inicio de sesión desde " +
                      "POST /api/v1/auth/set-contrasenia.\n\n" +
                      "Bienvenido/a!")
                .category("Aprobacion")
                .build();

        try {
            client.send(mail);
            log.info("[MAIL] Aprobacion enviada a {}", emailDestino);
        } catch (Exception e) {
            log.error("[MAIL] Error al enviar aprobacion a {}: {}", emailDestino, e.getMessage());
        }
    }

    public void enviarCambioClave(String emailDestino) {
        MailtrapMail mail = MailtrapMail.builder()
                .from(new Address("hello@demomailtrap.co", "BidFlow"))
                .to(List.of(new Address(emailDestino)))
                .subject("Tu contraseña fue cambiada")
                .text("Tu contraseña ha sido cambiado con exito.\n\n" +
                      "Si no realizaste este cambio, contactá a soporte de inmediato.")
                .category("CambioClave")
                .build();

        try {
            client.send(mail);
            log.info("[MAIL] Cambio de clave enviado a {}", emailDestino);
        } catch (Exception e) {
            log.error("[MAIL] Error al enviar cambio de clave a {}: {}", emailDestino, e.getMessage());
        }
    }
}
