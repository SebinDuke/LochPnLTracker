const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./PnL.db');

// NOTE: using sqlLite3 DB as its Embedded, Lightweight and Fast
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pnl (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pnl REAL NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      side TEXT CHECK(side IN ('BUY', 'SELL')) NOT NULL,
      symbol TEXT CHECK(symbol IN ('BTC', 'ETH', 'XRP')) NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT CHECK(symbol IN ('BTC', 'ETH', 'XRP')) NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    INSERT INTO pnl(id,pnl) VALUES(1,0) ON CONFLICT DO NOTHING;
  `);
});

module.exports = db;
