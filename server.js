const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3231;

// ================== KONFIG POSTGRES ==================
const pool = new Pool({
  user: "postgres",        // ganti sesuai user Anda
  host: "localhost",
  database: "postgres",
  password: "12345", // ganti
  port: 5432,
});

// Middleware JSON
app.use(express.json());

// ================== ENDPOINT POST DATA ==================
app.post("/api/data", async (req, res) => {
  const {
    timestamp,
    ph,
    ph_voltage,
    tds,
    tds_voltage,
    distance_cm,
    buzzer,
  } = req.body;

  // Validasi dasar
  if (!timestamp) {
    return res.status(400).json({ status: "error", message: "timestamp required" });
  }

  try {
    const query = `
      INSERT INTO sensor_data
      (timestamp, ph, ph_voltage, tds, tds_voltage, distance_cm, buzzer)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      timestamp,
      ph,
      ph_voltage,
      tds,
      tds_voltage,
      distance_cm,
      buzzer,
    ];

    await pool.query(query, values);

    console.log("Data tersimpan:", req.body);

    res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ status: "error", message: "database errorzzz", pesan: err.message });
  }
});

// ================== ENDPOINT GET DATA TERBARU ==================
app.get("/api/data", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sensor_data ORDER BY id DESC LIMIT 20"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ status: "error", message: "database error", pesan: err.message });
  }
});

// ================== CEK SERVER ==================
app.get("/", (req, res) => {
  res.send("Hydroponic Data Server Running");
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
