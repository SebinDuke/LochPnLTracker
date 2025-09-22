const express = require('express');
const router = express.Router();
const db = require('../DB/db');

const symbolList = ['BTC', 'ETH', 'XRP'];
const sideList = ['BUY', 'SELL'];
const currPrice = {'BTC':115000, 'ETH':4400, 'XRP':2.9}

function insertSuccessTrade(side, symbol, quantity, price, res){
  const tradeStmt = db.prepare('INSERT INTO trades (side, symbol, quantity, price) VALUES (?, ?, ?, ?)');
  tradeStmt.run(side, symbol, quantity, price, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Trade and holding recorded', tradeId: this.lastID });
  });
}

router.post('/addTrade', (req, res) => {
  const { symbol, quantity, price, side } = req.body;

  // Validations
  if (!symbol || !quantity || !price || !side) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (symbolList.indexOf(symbol) === -1){
    return res.status(400).json({ error: 'Unsupported symbol' });
  }
    if (sideList.indexOf(side) === -1){
    return res.status(400).json({ error: 'Unsupported symbol' });
  }

  // Add Trade to Holdings table for Buy
  if(side === 'BUY') {
    const holdingStmt = db.prepare('INSERT INTO holdings (symbol, quantity, price) VALUES (?, ?, ?)');
    holdingStmt.run(symbol, quantity, price, function (err) {
      if (err) {return res.status(500).json({ error: err.message });}
    });
    holdingStmt.finalize();
    insertSuccessTrade(side, symbol, quantity, price, res);
  }
  // For sell we need to remove from holdings first x units in the table and update pnl
  else {
    currPnL = 0;
    currQuant = quantity;
    deleteIds = [];
    updateId = null;
    updatedQuant = null;
    db.get('SELECT pnl FROM pnl', [], (err, row) => {
      if (err) {return res.status(500).json({ error: err.message });}
      currPnL = row.pnl;
    });
    // query holdings once but use the results again
    db.all('SELECT * FROM holdings WHERE symbol = ? ORDER BY id', [symbol], (err, rows) => {
      if (err) {return res.status(500).json({ error: err.message });}
      totQuantity = 0;
      rows.forEach(row => {
        totQuantity += row.quantity;
      });
      if(currQuant > totQuantity){
        return res.status(400).json({ error: 'SELL quantity higher than holdings' });
      }
      else{
        for (const row of rows){
          if(currQuant >= row.quantity){
            currPnL += (price - row.price) * row.quantity;
            deleteIds.push(row.id);
            currQuant -= row.quantity;
          }
          else{
            currPnL += (price - row.price) * currQuant;
            updateId = row.id;
            updatedQuant = row.quantity - currQuant;
            break;
          }
        }
      }

      // delete sold holdings
      if (deleteIds != []){
        const placeholders = deleteIds.map(() => '?').join(',');
        const deleteStmt = `DELETE FROM holdings WHERE id IN (${placeholders})`;
        db.run(deleteStmt, deleteIds, function(err) {
          if (err) {return res.status(500).json({ error: err.message });}
        });
      }

      //update last sold entry
      if (updateId != null && updatedQuant != null){
        const updateStmt = `UPDATE holdings SET quantity = ? WHERE id = ?`;
        db.run(updateStmt, [updatedQuant, updateId], function(err) {
          if (err) {return res.status(500).json({ error: err.message });}
        });
      }

      //update pnl
      const updatePnLStmt = `UPDATE pnl SET pnl = ? WHERE id = 1`;
      db.run(updatePnLStmt, [currPnL], function(err) {
        if (err) {return res.status(500).json({ error: err.message });}
      });
      insertSuccessTrade(side, symbol, quantity, price, res)
    });
  }
});

router.get('/getPortfolio', (req, res) => {
  db.all('SELECT * FROM holdings', [], (err, rows) => {
    if (err) {return res.status(500).json({ error: err.message });}
    // consolidate rows to single entries for each symbol
    holdings = {};
    rows.forEach(row => {
      var symbol = row.symbol;
      if(symbol in holdings){
        holdings[symbol].quantity += row.quantity;
        holdings[symbol].totalPrice += (row.price * row.quantity);
        holdings[symbol].avgPrice = holdings[symbol].totalPrice/holdings[symbol].quantity;
      }
      else{
        holdings[symbol] = {quantity: row.quantity, totalPrice: (row.quantity * row.price), avgPrice: row.price}
      }
    });
    res.json({ holdings: holdings });
  });
});

router.get('/getPnL', (req, res) => {
  unrealizedPnL = 0;
  db.all('SELECT * FROM holdings', [], (err, rows) => {
    if (err) {return res.status(500).json({ error: err.message });}
    rows.forEach(row => {
      var symbol = row.symbol;
      unrealizedPnL += (currPrice[symbol] - row.price) * row.quantity;
    });

    db.get('SELECT pnl FROM pnl', [], (err, row) => {
      if (err) {return res.status(500).json({ error: err.message });}
      res.json({ unrealizedPnL: unrealizedPnL, realizedPnL: row.pnl });
    });
  });
});

module.exports = router;