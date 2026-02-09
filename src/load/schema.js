const db = require("../../config/database");
const logger = require("../utils/logger"); // Menggunakan logger yang baru kita buat

async function initializeSchema() {
  // Query 1: Tabel Staging (Tempat mendarat data mentah)
  const createStagingTable = `
    CREATE TABLE IF NOT EXISTS staging_users (
      id SERIAL PRIMARY KEY,
      external_id INTEGER UNIQUE NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT,
      extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      audit_status TEXT DEFAULT 'RAW'
    );
  `;

  // Query 2: Tabel Dimensi/Produksi (Tempat data bersih & auditable)
  const createDimTable = `
    CREATE TABLE IF NOT EXISTS dim_users (
      user_key SERIAL PRIMARY KEY,
      external_id INTEGER UNIQUE NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT,
      validated_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT TRUE,      -- Penanda data masih ada di API
      last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    logger.info("--- Starting Schema Initialization ---");

    await db.query(createStagingTable);
    await db.query(createDimTable);

    logger.info("✅ All database tables are ready.");
  } catch (error) {
    logger.error(`❌ Schema Error: ${error.message}`);
    throw error;
  }
}

module.exports = { initializeSchema };
