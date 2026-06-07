# Gmail SMTP Integration Setup Guide

## Overview
This guide explains how to set up Gmail SMTP integration for NexMart marketing automation, including app password generation, n8n configuration, and email template setup.

## Prerequisites
- Google account with 2FA enabled
- n8n instance with admin access
- NexMart marketing automation workflows deployed

## Step 1: Enable 2-Factor Authentication

### 1.1 Enable 2FA on Google Account
1. Go to https://myaccount.google.com/security
2. Sign in to your Google account
3. Under "Signing in to Google", enable **2-Step Verification**
4. Follow the setup instructions

## Step 2: Generate App Password

### 2.1 Create App-Specific Password
1. Go to https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Select **Mail** from the app dropdown
4. Select **Other (Custom name)** and enter "NexMart n8n"
5. Click **Generate**
6. Copy the 16-character password (save this securely)

**Important:** This password will only be shown once. Save it in a secure password manager.

## Step 3: Configure n8n SMTP Credentials

### 3.1 Add SMTP Credentials
1. Open n8n
2. Go to **Credentials** → **Add Credential**
3. Select **SMTP**
4. Configure with the following settings:

```
Host: smtp.gmail.com
Port: 587
Security: TLS
User: your-email@gmail.com
Password: [your 16-character app password]
```

5. Name the credential: `Gmail SMTP`
6. Test the connection
7. Save the credential

### 3.2 Alternative: Use OAuth2 (Recommended for Production)
For production environments, use OAuth2 instead of app passwords:

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Configure n8n with OAuth2 credentials
6. Set up refresh token handling

## Step 4: Configure Email Templates

### 4.1 Email Best Practices
- Use responsive HTML templates
- Include plain text fallback
- Optimize for mobile devices
- Use inline CSS for email clients
- Test across multiple email clients

### 4.2 Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Email-safe CSS */
  </style>
</head>
<body>
  <div class="container">
    <!-- Email content -->
  </div>
</body>
</html>
```

### 4.3 Dynamic Variables
Use n8n expressions for dynamic content:
- `{{ $json.customer_name }}` - Customer name
- `{{ $json.order_number }}` - Order number
- `{{ $json.total }}` - Order total
- `{{ $now.format('yyyy-MM-dd') }}` - Current date

## Step 5: Configure Workflows

### 5.1 Update Email Nodes
Update all email nodes in workflows:
1. Select the `Gmail SMTP` credential
2. Set `fromEmail` to your verified email
3. Configure subject lines
4. Add email templates

### 5.2 Email Addresses
Use these email addresses for different purposes:
- `noreply@nexmart.ma` - Automated notifications
- `support@nexmart.ma` - Customer support
- `alerts@nexmart.ma` - System alerts
- `reports@nexmart.ma` - Business reports
- `vip@nexmart.ma` - VIP communications

## Step 6: Test Email Delivery

### 6.1 Test Basic Email
Create a simple test workflow:
1. Add **Email Send** node
2. Select `Gmail SMTP` credential
3. Send test email to yourself
4. Verify delivery and formatting

### 6.2 Test Workflow Emails
1. Trigger a test order
2. Verify order confirmation email
3. Check spam folder
4. Verify all links work correctly

## Step 7: Gmail Sending Limits

### 7.1 Free Gmail Account Limits
- 500 emails per day
- 500 recipients per day
- Rate limiting may apply

### 7.2 Google Workspace Limits
- 2,000 emails per day (Standard)
- 10,000 emails per day (Business)
- 1,500 recipients per day

### 7.3 Best Practices to Avoid Limits
- Implement rate limiting in n8n
- Use queue mode for high-volume sending
- Monitor email delivery rates
- Implement bounce handling
- Use dedicated email service for high volume

## Step 8: Advanced Configuration

### 8.1 Custom Domain Email (Recommended)
For production, use a custom domain:

1. Set up Google Workspace
2. Configure DNS records (MX, SPF, DKIM, DMARC)
3. Verify domain ownership
4. Create email addresses
5. Update n8n credentials

### 8.2 SPF/DKIM/DMARC Setup

**SPF Record:**
```
v=spf1 include:_spf.google.com ~all
```

**DKIM:**
Generate DKIM keys in Google Workspace admin console

**DMARC:**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@nexmart.ma
```

### 8.3 Email Tracking
Implement email tracking:
- Open tracking (pixel tracking)
- Click tracking (link wrapping)
- Delivery tracking (webhooks)
- Bounce handling (automatic retry)

## Step 9: Security Best Practices

### 9.1 Protect Credentials
- Never commit credentials to version control
- Use environment variables for sensitive data
- Rotate app passwords quarterly
- Monitor for unauthorized access

### 9.2 Email Security
- Enable TLS for all email connections
- Implement DKIM signing
- Set up DMARC policies
- Monitor for phishing attempts
- Use email authentication

### 9.3 Data Privacy
- Comply with GDPR/Moroccan data protection laws
- Allow users to unsubscribe
- Honor unsubscribe requests
- Implement data retention policies
- Anonymize tracking data

## Step 10: Monitoring & Troubleshooting

### 10.1 Monitor Email Delivery
Track these metrics:
- Delivery rate
- Open rate
- Click rate
- Bounce rate
- Spam complaints

### 10.2 Common Issues

**Authentication failed:**
- Verify app password is correct
- Check 2FA is enabled
- Ensure account is not locked

**Emails going to spam:**
- Check SPF/DKIM/DMARC records
- Verify email content quality
- Check sending reputation
- Reduce sending frequency

**Rate limiting:**
- Implement queue mode
- Add delays between sends
- Monitor sending limits
- Use dedicated email service

**Template not rendering:**
- Test in multiple email clients
- Use inline CSS
- Avoid JavaScript
- Keep HTML simple

## Step 11: Production Deployment

### 11.1 Dedicated Email Service (Recommended)
For high-volume production, consider:
- SendGrid
- Mailgun
- Amazon SES
- Postmark
- SparkPost

### 11.2 Email Queue Management
Implement queue mode in n8n:
1. Enable queue mode in n8n configuration
2. Set up Redis for queue storage
3. Configure concurrency limits
4. Implement retry logic

### 11.3 Backup & Recovery
- Export email templates regularly
- Backup credential configurations
- Document custom integrations
- Test restore procedures

## Email Template Examples

### Order Confirmation Template
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <!-- Content -->
  </div>
</body>
</html>
```

### Abandoned Cart Template
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; }
  </style>
</head>
<body>
  <div class="urgent">
    <strong>⚠️ Limited Time:</strong> Your cart is waiting!
  </div>
</body>
</html>
```

## Gmail API Reference

### SMTP Settings
```
Server: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Authentication: Yes
Username: your-email@gmail.com
Password: [app password]
```

### OAuth2 Scopes
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`

## Support & Resources
- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229
- App Passwords: https://support.google.com/accounts/answer/185833
- Email Best Practices: https://support.google.com/mail/answer/81126
- n8n Email Node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.emailsend/
- Google Workspace: https://workspace.google.com/

## Checklist
- [ ] Enable 2FA on Google account
- [ ] Generate app password
- [ ] Configure n8n SMTP credentials
- [ ] Test basic email delivery
- [ ] Configure email templates
- [ ] Update all workflows
- [ ] Set up custom domain (optional)
- [ ] Configure SPF/DKIM/DMARC
- [ ] Implement email tracking
- [ ] Set up monitoring
- [ ] Test production workflows
- [ ] Document configuration
- [ ] Train team on email management
