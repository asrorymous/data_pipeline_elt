const logger = require("./src/utils/logger");
const { initializeSchema } = require("./src/load/schema");
const { fetchUsersFromAPI } = require("./src/extract/api_client");
const { loadUsersToStaging } = require("./src/load/loader");
const { transformAndCleanData } = require("./src/load/transform");
const db = require("./config/database");

async function runPipeline() {
  logger.info("Starting Data Pipeline Execution...");

  try {
    // Step 1: Ensure Tables
    await initializeSchema();

    // Step 2: Extract
    const rawData = await fetchUsersFromAPI();

    // Step 3: Load to Staging
    await loadUsersToStaging(rawData);

    // Step 4: Transform to Production
    await transformAndCleanData();

    logger.info("🏁 PIPELINE SUCCESS: All stages completed safely.");
  } catch (err) {
    logger.error(`💀 PIPELINE FAILED: ${err.message}`);
    throw err;
  }
}

module.exports = { runPipeline };

if (require.main === module) {
  runPipeline()
    .then(async () => {
      logger.info("Pipeline finished, cleaning up connections...");
      await db.pool.end();
      logger.info("✅ Database pool closed. Goodbye!");
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error("Pipeline failed critical: " + err.message);
      if (db.pool) await db.pool.end();
      process.exit(1);
    });
}
