# Setting Up EmailJS for Hoot.ai

This guide explains how to set up EmailJS to enable email functionality in the Hoot.ai application.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account
2. The free plan allows 200 emails per month

## Step 2: Set Up an Email Service

1. In the EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps to connect your email account
5. Give your service a name (e.g., "Hoot.ai Contact Form")
6. Note the Service ID (you'll need it for the code)

## Step 3: Create an Email Template

1. In the EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Design your email template with the following variables:
   - `{{to_email}}` - Recipient email (mariam.morozova@gmail.com)
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{message}}` - Message content
   - `{{reply_to}}` - Reply to email address
4. Save the template
5. Note the Template ID (you'll need it for the code)

## Step 4: Update the Code

1. Open the following files:
   - `src/components/about.tsx`
   - `src/components/what-is-next.tsx`

2. Find and replace the following placeholders:
   - `service_kyq6yqw` - Your EmailJS Service ID from Step 2
   - `template_be78hr3` - Your EmailJS Template ID from Step 3
   - `bjZsfxXhjNiBXiLf7` - Your EmailJS Public Key (found in Account > API Keys)

3. The email sending code should look like this:
```javascript
const result = await emailjs.send(
  "service_kyq6yqw", // Your Service ID
  "template_be78hr3", // Your Template ID
  {
    to_email: "mariam.morozova@gmail.com",
    from_name: formData.name,
    from_email: formData.email,
    message: formData.message,
    reply_to: formData.email
  },
  "bjZsfxXhjNiBXiLf7" // Your Public Key
);
```

## Troubleshooting Common Errors

1. **"The public key should be set" error**:
   - Make sure you're passing your public key as the fourth parameter to the `emailjs.send` method

2. **"Invalid template ID" or "Invalid service ID" errors**:
   - Double-check that your template ID and service ID are correct
   - Make sure the template exists and is active in your EmailJS dashboard

3. **"Network error" or timeout issues**:
   - Check your internet connection
   - EmailJS servers might be temporarily unavailable

4. **Template rendering errors**:
   - Ensure your template variables match the parameters you're sending
   - Check for any syntax errors in your email template

5. **CORS issues**:
   - EmailJS should handle CORS properly, but if you're getting CORS errors, make sure your domain is whitelisted in your EmailJS account settings

6. **Rate limiting**:
   - The free plan has limitations. Check if you've exceeded your monthly limit

If you encounter any other issues, check the browser console for detailed error messages and visit the [EmailJS documentation](https://www.emailjs.com/docs/) for more information.

## Testing

After setting up EmailJS, test the contact forms in both the About and What's Next pages to ensure emails are being sent properly to mariam.morozova@gmail.com. 