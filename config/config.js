module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
    polling: {
      interval: 300
    }
  },
  database: {
    path: process.env.DATABASE_PATH || './expenses.db'
  },
  categories: [
    'food',
    'transport',
    'shopping',
    'entertainment',
    'utilities',
    'health',
    'other'
  ],
  limits: {
    maxAmount: 10000,
    maxDescription: 200
  }
};