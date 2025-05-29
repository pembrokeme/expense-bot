# Deployment Guide

## Prerequisites

- Node.js (v14 or higher)
- Telegram Bot Token (get from @BotFather on Telegram)
- Server or hosting platform

## Local Development

1. Clone the repository
```bash
git clone <repository-url>
cd expense-bot
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Add your bot token to `.env`
```
BOT_TOKEN=your_bot_token_here
DATABASE_PATH=./expenses.db
```

5. Start the bot
```bash
npm start
```

## Production Deployment

### Using PM2 (recommended)

1. Install PM2 globally
```bash
npm install -g pm2
```

2. Start the bot with PM2
```bash
pm2 start src/index.js --name expense-bot
```

3. Save PM2 configuration
```bash
pm2 save
pm2 startup
```

### Using Docker

1. Create Dockerfile (if needed)
2. Build image
```bash
docker build -t expense-bot .
```

3. Run container
```bash
docker run -d --name expense-bot -e BOT_TOKEN=your_token expense-bot
```

## Environment Variables

- `BOT_TOKEN` - Telegram bot token (required)
- `DATABASE_PATH` - Path to SQLite database file (optional, defaults to ./expenses.db)

## Monitoring

- Logs are stored in `./logs/` directory
- Use `pm2 logs expense-bot` to view real-time logs
- Check `info.log` for general operations
- Check `error.log` for errors

## Backup

Regularly backup your SQLite database file:
```bash
cp expenses.db expenses_backup_$(date +%Y%m%d).db
```