# Telegram Integration Setup Guide

## Overview
This guide explains how to set up Telegram integration for NexMart marketing automation, including bot creation, API key configuration, and webhook setup.

## Prerequisites
- Telegram account
- n8n instance with admin access
- NexMart marketing automation workflows deployed

## Step 1: Create Telegram Bot

### 1.1 Start a conversation with BotFather
1. Open Telegram and search for `@BotFather`
2. Start a conversation with `/start`
3. Create a new bot with `/newbot`

### 1.2 Configure Your Bot
1. BotFather will ask for a bot name (e.g., `NexMart Bot`)
2. BotFather will ask for a username (must end in `bot`, e.g., `nexmart_bot`)
3. BotFather will provide your **API Token** - save this securely

### 1.3 Enable Bot Features (Optional)
- `/setinline` - Enable inline mode
- `/setinlinefeedback` - Enable inline feedback
- `/setjoingroups` - Allow bot to be added to groups
- `/setprivacy` - Set privacy mode (recommended: Disabled for marketing)

## Step 2: Get Your Chat ID

### 2.1 For Personal Messages
1. Start a conversation with your bot
2. Send a message to your bot
3. Visit: `https://api.telegram.org/bot<YOUR_API_TOKEN>/getUpdates`
4. Look for `chat.id` in the response JSON

### 2.2 For Group/Channel Messages
1. Add your bot to the group/channel
2. Send a message in the group/channel
3. Visit: `https://api.telegram.org/bot<YOUR_API_TOKEN>/getUpdates`
4. Look for `chat.id` (usually negative for groups, starts with `-100` for supergroups)

## Step 3: Configure n8n Credentials

### 3.1 Add Telegram API Credentials
1. Open n8n
2. Go to **Credentials** → **Add Credential**
3. Select **Telegram API**
4. Enter your **API Token** from BotFather
5. Name the credential: `Telegram API`
6. Test the connection
7. Save the credential

### 3.2 Set Environment Variables
Add these to your n8n environment variables:

```bash
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Step 4: Configure Workflows

### 4.1 Admin Notifications
Update the following workflows with your Telegram chat ID:
- Order Confirmation Automation
- Low Stock Alert
- VIP Customer Automation
- Daily Business Report
- Weekly CEO Report

### 4.2 Customer Notifications (Optional)
For customer-facing Telegram notifications:
1. Create a separate bot for customer communications
2. Implement user chat ID collection during signup
3. Update workflows to use customer chat IDs

## Step 5: Test the Integration

### 5.1 Test Basic Message
Create a simple test workflow in n8n:
1. Add **Telegram** node
2. Select your credential
3. Enter your chat ID
4. Send a test message: "Hello from NexMart!"

### 5.2 Test Workflow Integration
1. Trigger a test order
2. Verify admin notification is received
3. Check message formatting
4. Verify all data is displayed correctly

## Step 6: Advanced Configuration

### 6.1 Custom Keyboard Buttons
```javascript
{
  "reply_markup": {
    "inline_keyboard": [
      [
        {"text": "View Order", "url": "https://nexmart.ma/orders/123"},
        {"text": "Contact Support", "callback_data": "support"}
      ]
    ]
  }
}
```

### 6.2 Rich Formatting
Use Markdown or HTML for formatted messages:
- **Bold**: `*text*` or `<b>text</b>`
- *Italic*: `_text_` or `<i>text</i>`
- [Links]: `[text](url)` or `<a href="url">text</a>`
- Code: `` `code` `` or `<code>code</code>`

### 6.3 Message Templates
Create reusable message templates in n8n:
1. Use Function nodes to format messages
2. Store templates in PostgreSQL or Redis
3. Dynamically insert data into templates

## Step 7: Security Best Practices

### 7.1 Protect Your Bot Token
- Never commit bot tokens to version control
- Use environment variables for sensitive data
- Rotate tokens periodically
- Monitor bot usage for anomalies

### 7.2 Rate Limiting
Telegram has rate limits:
- 30 messages per second to different chats
- 20 messages per minute to the same chat
- Implement rate limiting in n8n workflows

### 7.3 Access Control
- Restrict bot commands to authorized users
- Validate chat IDs before sending messages
- Implement webhook security (if using webhooks)

## Step 8: Monitoring & Troubleshooting

### 8.1 Monitor Bot Activity
Use Telegram's getUpdates endpoint:
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

### 8.2 Common Issues

**Bot not responding:**
- Check if bot token is correct
- Verify bot is not blocked by user
- Check rate limits

**Messages not formatting correctly:**
- Verify parse_mode parameter
- Check for invalid markdown/html syntax
- Test message formatting in Telegram web client

**Webhook not receiving updates:**
- Verify webhook URL is accessible
- Check SSL certificate (must be valid)
- Verify webhook is set correctly

## Step 9: Production Deployment

### 9.1 Webhook Setup (Recommended)
For production, use webhooks instead of polling:

```bash
curl -X POST \
  https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -d url=https://your-n8n-instance.com/webhook/telegram \
  -d max_connections=100
```

### 9.2 Load Balancing
For high-volume deployments:
- Use multiple bot instances
- Implement message queuing
- Use Redis for distributed locking

### 9.3 Backup & Recovery
- Export bot configuration regularly
- Backup chat ID mappings
- Document custom integrations

## Telegram API Reference

### Useful Endpoints
- `getMe` - Get bot information
- `getUpdates` - Get incoming updates
- `sendMessage` - Send text message
- `sendPhoto` - Send photo
- `sendDocument` - Send document
- `setWebhook` - Set webhook
- `deleteWebhook` - Delete webhook

### Error Codes
- 429: Too many requests (rate limit)
- 401: Unauthorized (invalid token)
- 400: Bad request (invalid parameters)
- 403: Forbidden (bot blocked)

## Example Workflow Configurations

### Admin Alert Template
```json
{
  "chatId": "={{ $env.TELEGRAM_ADMIN_CHAT_ID }}",
  "text": "🛒 **New Order**\n\nOrder: #{{ $json.orderNumber }}\nCustomer: {{ $json.customerName }}\nTotal: {{ $json.total }} MAD",
  "options": {
    "parseMode": "markdown"
  }
}
```

### Customer Notification Template
```json
{
  "chatId": "={{ $json.customerChatId }}",
  "text": "Your order #{{ $json.orderNumber }} has been shipped! 🚚\n\nTracking: {{ $json.trackingNumber }}",
  "options": {
    "parseMode": "markdown"
  }
}
```

## Support & Resources
- Telegram Bot API: https://core.telegram.org/bots/api
- BotFather: @BotFather
- n8n Telegram Node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/
- Telegram API Limits: https://core.telegram.org/bots/faq

## Checklist
- [ ] Create Telegram bot via BotFather
- [ ] Save API token securely
- [ ] Get admin chat ID
- [ ] Configure n8n credentials
- [ ] Set environment variables
- [ ] Update workflows with chat ID
- [ ] Test basic message
- [ ] Test workflow integration
- [ ] Configure webhook (production)
- [ ] Set up monitoring
- [ ] Document configuration
- [ ] Train team on usage
