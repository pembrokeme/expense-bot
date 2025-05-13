const TelegramBot = require('node-telegram-bot-api');
const Database = require('./database');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Initialize database
const db = new Database();

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
Welcome to Expense Bot! 💰

I'll help you track your daily expenses. Here are the commands you can use:

/add - Add a new expense
/list - Show recent expenses
/summary - Get spending summary
/help - Show this help message

Let's start tracking your expenses!
  `;

  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 *Expense Bot Help*

*Commands:*
/add <amount> <category> <description> - Add an expense
/list - Show your recent expenses
/summary - Get spending summary for this month
/help - Show this help message

*Examples:*
/add 15.50 food lunch at cafe
/add 50 transport monthly bus pass
/add 120 shopping new shoes

Categories: food, transport, shopping, entertainment, utilities, health, other
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

console.log('Expense Bot is running...');