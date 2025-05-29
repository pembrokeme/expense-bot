const Database = require('../src/database');
const fs = require('fs');

describe('Database', () => {
  let db;
  const testDbPath = './test.db';

  beforeEach(() => {
    // Remove test database if exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.DATABASE_PATH = testDbPath;
    db = new Database();
  });

  afterEach(() => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should add expense', async () => {
    const userId = 123;
    const amount = 25.50;
    const category = 'food';
    const description = 'lunch';

    const expenseId = await db.addExpense(userId, amount, category, description);
    expect(expenseId).toBeDefined();
    expect(typeof expenseId).toBe('number');
  });

  test('should retrieve expenses', async () => {
    const userId = 123;

    await db.addExpense(userId, 25.50, 'food', 'lunch');
    await db.addExpense(userId, 15.00, 'transport', 'bus');

    const expenses = await db.getExpenses(userId, 10);
    expect(expenses).toHaveLength(2);
    expect(expenses[0].amount).toBe(15.00); // Most recent first
    expect(expenses[1].amount).toBe(25.50);
  });

  test('should get monthly summary', async () => {
    const userId = 123;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    await db.addExpense(userId, 25.50, 'food', 'lunch');
    await db.addExpense(userId, 15.00, 'food', 'dinner');
    await db.addExpense(userId, 30.00, 'transport', 'taxi');

    const summary = await db.getMonthlyTotal(userId, year, month);

    const foodSummary = summary.find(s => s.category === 'food');
    const transportSummary = summary.find(s => s.category === 'transport');

    expect(foodSummary.total).toBe(40.50);
    expect(foodSummary.count).toBe(2);
    expect(transportSummary.total).toBe(30.00);
    expect(transportSummary.count).toBe(1);
  });
});