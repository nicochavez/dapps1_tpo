package com.tpo.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.from:${spring.mail.username}}") String from) {
        this.mailSender = mailSender;
        this.from = from;
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
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(from);
        mensaje.setTo(emailDestino);
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);

        try {
            mailSender.send(mensaje);
            log.info("[MAIL] {} enviado a {}", tipo, emailDestino);
        } catch (Exception e) {
            log.error("[MAIL] Error al enviar {} a {}: {}", tipo, emailDestino, e.getMessage());
        }
    }
}
