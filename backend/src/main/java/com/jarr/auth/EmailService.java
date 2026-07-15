package com.jarr.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify your Jarr Account");
        message.setText("Welcome to Jarr!\n\n" +
                "Please click the link below to verify your email address and activate your account:\n" +
                verificationUrl + "\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Thanks,\nThe Jarr Team");
                
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset your Jarr Password");
        message.setText("Hello,\n\n" +
                "We received a request to reset your password for your Jarr account.\n" +
                "Click the link below to set a new password:\n" +
                resetUrl + "\n\n" +
                "If you did not request a password reset, please ignore this email or contact support if you have concerns.\n\n" +
                "Thanks,\nThe Jarr Team");
                
        mailSender.send(message);
    }
}
