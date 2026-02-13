const db = require("../../config/database");
const logger = require("../utils/logger");

async function transformAndCleanData() {
  logger.info("--- Starting Data Transformation & Quality Audit ---");

  const transformQuery = `
  INSERT INTO dim_users (external_id, user_name, user_email, validated_at, is_active, last_seen_at)
  SELECT 
    external_id, 
    -- Sapu 1: Bersihkan spasi di awal/akhir nama dan jadikan UPPER
    UPPER(TRIM(user_name)), 
    -- Sapu 2: Kecilkan semua huruf email agar konsisten
    LOWER(TRIM(user_email)), 
    CURRENT_TIMESTAMP,
    TRUE,
    CURRENT_TIMESTAMP
  FROM staging_users
  WHERE 
    -- Saringan Email: Harus valid formatnya
    user_email LIKE '%@%.%' 
    -- Saringan Nama: Tidak boleh NULL dan harus lebih dari 3 karakter bersih (bukan spasi)
    AND user_name IS NOT NULL 
    AND LENGTH(TRIM(user_name)) > 3
    -- Saringan Tambahan: Pastikan external_id-nya masuk akal
    AND external_id IS NOT NULL
  ON CONFLICT (external_id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    user_email = EXCLUDED.user_email,
    validated_at = EXCLUDED.validated_at,
    last_seen_at = EXCLUDED.last_seen_at;
`;

  try {
    await db.query("BEGIN");

    const result = await db.query(transformQuery);

    await db.query("COMMIT");
    logger.info(
      `✅ Transformation Complete. Records affected: ${result.rowCount}`,
    );
  } catch (error) {
    await db.query("ROLLBACK");
    logger.error(`❌ Transformation Failed (Rolled Back): ${error.message}`);
    throw error;
  }
}

module.exports = { transformAndCleanData };
