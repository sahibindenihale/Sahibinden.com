const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Basit sağlık kontrolü
app.get("/", (req, res) => {
  res.send("Ihale backend çalışıyor 🚀");
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Basit teklif endpoint (şimdilik test için)
app.post("/api/bid", async (req, res) => {
  const { name, amount } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: "name ve amount gerekli" });
  }

  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS bids (id SERIAL PRIMARY KEY, name TEXT, amount INTEGER)"
    );

    await pool.query(
      "INSERT INTO bids (name, amount) VALUES ($1, $2)",
      [name, amount]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
