# EmailJS Setup Guide for Birthday Reminders

## Overview
The birthday reminder system uses EmailJS to send real email notifications. This guide will help you set up EmailJS to enable email functionality.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook/Hotmail**
   - **Yahoo**
   - **Custom SMTP**
4. Follow the setup instructions for your chosen provider
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

### Template Variables:
```
Subject: 🎂 Birthday Reminder: {{birthday_name}}'s Birthday!

Body:
Hi {{to_name}}!

This is your friendly reminder that {{birthday_name}}'s birthday is coming up on {{birthday_date}}.

{{#if reminder_note}}
Your note: {{reminder_note}}
{{/if}}

Don't forget to create a magical birthday link for them at: {{website_link}}

Best regards,
Luxury Birthday Reminder System
```

4. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `user_abcdef123456`)

## Step 5: Update the Code

Open `/email-reminders.js` and replace the placeholder values:

```javascript
// Line 2: Replace YOUR_PUBLIC_KEY
emailjs.init("YOUR_PUBLIC_KEY_HERE");

// Line 87: Replace YOUR_SERVICE_ID and YOUR_TEMPLATE_ID
emailjs.send('YOUR_SERVICE_ID_HERE', 'YOUR_TEMPLATE_ID_HERE', templateParams)
```

### Example:
```javascript
// Initialize EmailJS
emailjs.init("user_abcdef123456");

// Send email
emailjs.send('service_gmail123', 'template_birthday456', templateParams)
```

## Step 6: Test the System

1. Open `reminders.html` in your browser
2. Fill out the reminder form
3. Set a reminder date for today or tomorrow
4. Submit the form
5. Check if you receive the test email

## Email Template Variables Explained

The system automatically populates these variables:

- `{{to_email}}` - Recipient's email address
- `{{to_name}}` - Extracted from email (part before @)
- `{{birthday_name}}` - Name of birthday person
- `{{birthday_date}}` - Formatted birthday date
- `{{reminder_note}}` - Optional user note
- `{{website_link}}` - Link back to the generator

## Troubleshooting

### Common Issues:

1. **Emails not sending**
   - Check your Service ID and Template ID are correct
   - Verify your email service is properly connected
   - Check browser console for error messages

2. **Template not found error**
   - Ensure template ID matches exactly
   - Template must be published (not draft)

3. **Service connection failed**
   - Re-authenticate your email service in EmailJS dashboard
   - Check if 2FA is enabled (may need app password)

### Gmail Setup Tips:

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password for EmailJS
3. Use the App Password instead of your regular password

## Free Plan Limitations

EmailJS free plan includes:
- 200 emails per month
- EmailJS branding in emails
- Basic templates

For higher volume or custom branding, consider upgrading to a paid plan.

## Security Notes

- Never expose your Private Key in client-side code
- Public Key is safe to use in frontend applications
- EmailJS handles the secure email sending on their servers

## Alternative Solutions

If you need more advanced scheduling or higher volume:

1. **Backend Integration**: Use Node.js with node-cron and Nodemailer
2. **Cloud Functions**: Firebase Functions or AWS Lambda with SES
3. **Third-party Services**: SendGrid, Mailgun, or similar services

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/

---

**Note**: The current implementation checks for due reminders on page load. For production use, consider implementing a proper backend scheduler for more reliable email delivery.