const db = require("../../config/database");
const logger = require("../utils/logger");

async function transformAndCleanData() {
  logger.info("--- Starting Data Transformation & Quality Audit ---");

  const transformQuery = `
  INSERT INTO dim_users (external_id, user_name, user_email, validated_at, is_active, last_seen_at)
  SELECT 
    external_id, 
    -- Normalize name (trim & uppercase)
    UPPER(TRIM(user_name)), 
    -- Normalize email to lowercase
    LOWER(TRIM(user_email)), 
    CURRENT_TIMESTAMP,
    TRUE,
    CURRENT_TIMESTAMP
  FROM staging_users
  WHERE 
    -- Email format filter
    user_email LIKE '%@%.%' 
    -- Name length & nullity check
    AND user_name IS NOT NULL 
    AND LENGTH(TRIM(user_name)) > 3
    -- Identity check
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
