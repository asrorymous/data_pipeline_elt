const db = require("../../config/database");
const logger = require("../utils/logger");

async function transformAndCleanData() {
  logger.info("--- Starting Data Transformation & Quality Audit ---");

  const transformQuery = `
    INSERT INTO dim_users (external_id, user_name, user_email, validated_at, is_active, last_seen_at)
    SELECT 
      external_id, 
      UPPER(user_name), 
      LOWER(user_email), 
      CURRENT_TIMESTAMP,
      TRUE,              -- Setiap data yang masuk dari staging dianggap aktif
      CURRENT_TIMESTAMP  -- Mencatat kapan terakhir data ini sinkron
    FROM staging_users
    WHERE user_email LIKE '%@%.%' 
    AND LENGTH(user_name) > 3     
    ON CONFLICT (external_id) DO UPDATE SET
      user_name = EXCLUDED.user_name,
      user_email = EXCLUDED.user_email,
      validated_at = EXCLUDED.validated_at,
      is_active = TRUE,
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
