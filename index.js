const logger = require("./src/utils/logger");
const { runPipeline } = require("./src/pipeline/run_pipeline");
const db = require("./config/database");

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

module.exports = { runPipeline };
