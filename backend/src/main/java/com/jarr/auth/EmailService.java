package com.jarr.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${jarr.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:jarr.noreply@gmail.com}")
    private String fromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Jarr icon-192x192.png embedded as base64 — works in all email clients without needing a public URL
    private static final String ICON_BASE64 =
        "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";


    private String buildEmail(String headline, String bodyHtml, String ctaUrl, String ctaLabel) {
        return "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<title>" + headline + "</title></head>" +
            "<body style='margin:0;padding:0;background:#0A0A0A;font-family:Inter,Helvetica Neue,Arial,sans-serif;'>" +
            "  <table width='100%' cellpadding='0' cellspacing='0' style='background:#0A0A0A;padding:40px 16px;'>" +
            "    <tr><td align='center'>" +
            "      <table width='100%' style='max-width:480px;background:#141414;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;'>" +
            // Header strip with Jarr logo
            "        <tr><td style='background:#1a1a1a;border-bottom:1px solid #2a2a2a;padding:24px 32px;'>" +
            "          <table cellpadding='0' cellspacing='0'><tr>" +
            "            <td style='width:36px;height:36px;background:#222;border:1px solid #333;border-radius:10px;text-align:center;vertical-align:middle;overflow:hidden;'>" +
            "              <img src='cid:jarrLogo' width='36' height='36' alt='Jarr' style='display:block;border-radius:10px;' />" +
            "            </td>" +
            "            <td style='padding-left:12px;'>" +
            "              <span style='font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;'>Jarr.</span>" +
            "            </td>" +
            "          </tr></table>" +
            "        </td></tr>" +
            // Body
            "        <tr><td style='padding:32px;'>" +
            "          <h1 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.4px;line-height:1.3;'>" + headline + "</h1>" +
            "          <div style='font-size:14px;color:#999;line-height:1.7;'>" + bodyHtml + "</div>" +
            // CTA button
            "          <div style='margin-top:28px;'>" +
            "            <a href='" + ctaUrl + "' style='display:inline-block;padding:13px 28px;background:#FFFFFF;color:#0A0A0A;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;'>"+ctaLabel+"</a>" +
            "          </div>" +
            // Fallback URL
            "          <p style='margin:20px 0 0;font-size:12px;color:#555;line-height:1.6;'>Or copy this link into your browser:<br>" +
            "            <a href='" + ctaUrl + "' style='color:#638fb8;word-break:break-all;'>" + ctaUrl + "</a>" +
            "          </p>" +
            "        </td></tr>" +
            // Footer
            "        <tr><td style='padding:20px 32px;border-top:1px solid #222;'>" +
            "          <p style='margin:0;font-size:12px;color:#444;'>This email was sent by Jarr. If you didn't request this, you can safely ignore it.</p>" +
            "        </td></tr>" +
            "      </table>" +
            "    </td></tr>" +
            "  </table>" +
            "</body></html>";
    }

    // ── Send methods ────────────────────────────────────────────────────────

    public void sendVerificationEmail(String toEmail, String token) {
        String url = frontendUrl + "/verify-email?token=" + token;

        String body = "Welcome to Jarr — your personal finance tracker.<br><br>" +
            "Click the button below to verify your email address and activate your account.<br><br>" +
            "<span style='color:#555;font-size:13px;'>This link expires in 24 hours.</span>";

        String html = buildEmail("Verify your email address", body, url, "Verify Email →");

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, "Jarr");
            helper.setTo(toEmail);
            helper.setSubject("Verify your Jarr account");
            helper.setText(html, true);
            
            // Embed logo as an inline attachment (CID) to bypass Gmail's data: URI blocking
            helper.addInline("jarrLogo", new ByteArrayResource(Base64.getDecoder().decode(ICON_BASE64)), "image/png");
            
            mailSender.send(msg);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String url = frontendUrl + "/reset-password?token=" + token;

        String body = "We received a request to reset the password for your Jarr account.<br><br>" +
            "Click the button below to choose a new password.<br><br>" +
            "<span style='color:#555;font-size:13px;'>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</span>";

        String html = buildEmail("Reset your password", body, url, "Reset Password →");

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, "Jarr");
            helper.setTo(toEmail);
            helper.setSubject("Reset your Jarr password");
            helper.setText(html, true);
            
            // Embed logo as an inline attachment (CID) to bypass Gmail's data: URI blocking
            helper.addInline("jarrLogo", new ByteArrayResource(Base64.getDecoder().decode(ICON_BASE64)), "image/png");
            
            mailSender.send(msg);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}

