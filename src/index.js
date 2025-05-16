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

// Handle /add command
bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const input = match[1];

  // Parse input: amount category description
  const parts = input.split(' ');
  if (parts.length < 2) {
    bot.sendMessage(chatId, '❌ Invalid format. Use: /add <amount> <category> <description>');
    return;
  }

  const amount = parseFloat(parts[0]);
  const category = parts[1].toLowerCase();
  const description = parts.slice(2).join(' ') || '';

  if (isNaN(amount) || amount <= 0) {
    bot.sendMessage(chatId, '❌ Please enter a valid amount (number greater than 0)');
    return;
  }

  const validCategories = ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'health', 'other'];
  if (!validCategories.includes(category)) {
    bot.sendMessage(chatId, `❌ Invalid category. Choose from: ${validCategories.join(', ')}`);
    return;
  }

  try {
    await db.addExpense(userId, amount, category, description);
    const message = `✅ Expense added successfully!

💰 Amount: $${amount.toFixed(2)}
📂 Category: ${category}
📝 Description: ${description || 'None'}`;

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error adding expense:', error);
    bot.sendMessage(chatId, '❌ Failed to add expense. Please try again.');
  }
});

console.log('Expense Bot is running...');