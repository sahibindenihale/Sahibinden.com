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

// USERS TABLOSU OLUŞTUR
async function initUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active BOOLEAN DEFAULT false
    )
  `);
}

initUsersTable();

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email ve password gerekli" });
  }

  try {
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, password]
    );

    res.json({ success: true, message: "Kayıt oluşturuldu, admin onayı bekleniyor." });
  } catch (err) {
    res.status(400).json({ error: "Bu email zaten kayıtlı." });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Geçersiz bilgiler" });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return res.status(403).json({ error: "Hesap henüz aktif değil" });
  }

  res.json({ success: true, userId: user.id });
});

// ADMIN AKTİF ET
app.post("/api/admin/activate", async (req, res) => {
  const { email } = req.body;

  await pool.query(
    "UPDATE users SET is_active=true WHERE email=$1",
    [email]
  );

  res.json({ success: true });
});

// TEKLİF VER (aktif kullanıcı kontrolü)
app.post("/api/bid", async (req, res) => {
  const { email, amount } = req.body;

  const userResult = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(401).json({ error: "Kullanıcı bulunamadı" });
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    return res.status(403).json({ error: "Hesap aktif değil" });
  }

  await pool.query(
    "CREATE TABLE IF NOT EXISTS bids (id SERIAL PRIMARY KEY, email TEXT, amount INTEGER)"
  );

  await pool.query(
    "INSERT INTO bids (email, amount) VALUES ($1, $2)",
    [email, amount]
  );

  res.json({ success: true });
});
