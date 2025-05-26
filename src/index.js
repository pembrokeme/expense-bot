const TelegramBot = require('node-telegram-bot-api');
const Database = require('./database');
const logger = require('./logger');
const config = require('../config/config');
require('dotenv').config();

const token = config.bot.token;
const bot = new TelegramBot(token, { polling: true });

// Initialize database
const db = new Database();

// Error handling
bot.on('error', (error) => {
  logger.error(`Bot error: ${error.message}`);
});

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.message}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;

  logger.info(`New user started bot: ${userName} (${userId})`);

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

  if (!config.categories.includes(category)) {
    bot.sendMessage(chatId, `❌ Invalid category. Choose from: ${config.categories.join(', ')}`);
    return;
  }

  if (amount > config.limits.maxAmount) {
    bot.sendMessage(chatId, `❌ Amount too large. Maximum allowed: $${config.limits.maxAmount}`);
    return;
  }

  if (description.length > config.limits.maxDescription) {
    bot.sendMessage(chatId, `❌ Description too long. Maximum ${config.limits.maxDescription} characters.`);
    return;
  }

  try {
    await db.addExpense(userId, amount, category, description);

    logger.info(`Expense added: User ${userId}, Amount: $${amount}, Category: ${category}`);

    const message = `✅ Expense added successfully!

💰 Amount: $${amount.toFixed(2)}
📂 Category: ${category}
📝 Description: ${description || 'None'}`;

    bot.sendMessage(chatId, message);
  } catch (error) {
    logger.error(`Error adding expense for user ${userId}: ${error.message}`);
    bot.sendMessage(chatId, '❌ Failed to add expense. Please try again.');
  }
});

// Handle /list command
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const expenses = await db.getExpenses(userId, 10);

    if (expenses.length === 0) {
      bot.sendMessage(chatId, '📝 No expenses found. Use /add to record your first expense!');
      return;
    }

    let message = '📋 *Your Recent Expenses:*\n\n';
    let total = 0;

    expenses.forEach((expense, index) => {
      const date = new Date(expense.date).toLocaleDateString();
      const amount = parseFloat(expense.amount);
      total += amount;

      message += `${index + 1}. *$${amount.toFixed(2)}* - ${expense.category}\n`;
      message += `   ${expense.description || 'No description'}\n`;
      message += `   📅 ${date}\n\n`;
    });

    message += `💰 *Total: $${total.toFixed(2)}*`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    bot.sendMessage(chatId, '❌ Failed to fetch expenses. Please try again.');
  }
});

// Handle /summary command
bot.onText(/\/summary/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
    const summary = await db.getMonthlyTotal(userId, year, month);

    if (summary.length === 0) {
      bot.sendMessage(chatId, '📊 No expenses found for this month. Start tracking your expenses with /add!');
      return;
    }

    let message = `📊 *Monthly Summary (${year}-${month.toString().padStart(2, '0')}):*\n\n`;
    let totalAmount = 0;
    let totalCount = 0;

    summary.forEach(item => {
      const amount = parseFloat(item.total);
      totalAmount += amount;
      totalCount += item.count;

      message += `📂 *${item.category}*: $${amount.toFixed(2)} (${item.count} transactions)\n`;
    });

    message += `\n💰 *Total Spent: $${totalAmount.toFixed(2)}*\n`;
    message += `📝 *Total Transactions: ${totalCount}*`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching summary:', error);
    bot.sendMessage(chatId, '❌ Failed to fetch summary. Please try again.');
  }
});

logger.info('Expense Bot started successfully');
console.log('Expense Bot is running...');