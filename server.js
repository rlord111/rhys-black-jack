const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const dbPath = path.resolve(__dirname, "rhyscoin.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite DB:", err);
  } else {
    console.log("✅ Connected to rhyscoin.db");
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("🎮 Welcome to Rhys Coin Platform!");
});

app.get("/balance/:email", (req, res) => {
  const email = req.params.email;
  db.get("SELECT coins FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ email, balance: row ? row.coins : 0 });
  });
});

app.post("/add-coins", (req, res) => {
  const { email, amount } = req.body;
  db.run(\`
    INSERT INTO users (email, coins)
    VALUES (?, ?)
    ON CONFLICT(email) DO UPDATE SET coins = coins + ?
  \`, [email, amount, amount], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(\`🚀 Server running at http://localhost:\${port}\`);
});
