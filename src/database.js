const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = process.env.DATABASE_PATH || './expenses.db';
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createExpensesTable, (err) => {
      if (err) {
        console.error('Error creating expenses table:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  addExpense(userId, amount, category, description) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO expenses (user_id, amount, category, description)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(query, [userId, amount, category, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getExpenses(userId, limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM expenses
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT ?
      `;

      this.db.all(query, [userId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getMonthlyTotal(userId, year, month) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM(amount) as total, category, COUNT(*) as count
        FROM expenses
        WHERE user_id = ?
        AND strftime('%Y', date) = ?
        AND strftime('%m', date) = ?
        GROUP BY category
      `;

      this.db.all(query, [userId, year.toString(), month.toString().padStart(2, '0')], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Database;