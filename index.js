const logger = require("./src/utils/logger");
const { initializeSchema } = require("./src/load/schema");
const { fetchUsersFromAPI } = require("./src/extract/api_client");
const { loadUsersToStaging } = require("./src/load/loader");
const { transformAndCleanData } = require("./src/load/transform");
const db = require("./config/database");

async function runPipeline() {
  logger.info("Starting Data Pipeline Execution...");

  let runId = null;

  try {
    // Step 1: Ensure Tables
    await initializeSchema();

    // Step 2: Create RUN record
    const { rows } = await db.query(`
      INSERT INTO pipeline_runs (started_at, status)
      VALUES (NOW(), 'RUNNING')
      RETURNING id
    `);

    runId = rows[0].id;
    logger.info(`Pipeline Run ID: ${runId}`);

    // Step 3: Extract
    const rawData = await fetchUsersFromAPI();

    await db.query(
      `UPDATE pipeline_runs SET extracted_count = $1 WHERE id = $2`,
      [rawData.length, runId],
    );

    // Step 4: Load
    await loadUsersToStaging(rawData);

    await db.query(`UPDATE pipeline_runs SET loaded_count = $1 WHERE id = $2`, [
      rawData.length,
      runId,
    ]);

    // Step 5: Transform
    const affectedRows = await transformAndCleanData();

    await db.query(
      `UPDATE pipeline_runs SET transformed_count = $1 WHERE id = $2`,
      [affectedRows || 0, runId],
    );

    // Step 6: Mark SUCCESS
    await db.query(
      `UPDATE pipeline_runs 
       SET status = 'SUCCESS', finished_at = NOW()
       WHERE id = $1`,
      [runId],
    );

    logger.info("🏁 PIPELINE SUCCESS: All stages completed safely.");
  } catch (err) {
    if (runId) {
      await db.query(
        `UPDATE pipeline_runs 
         SET status = 'FAILED', finished_at = NOW()
         WHERE id = $1`,
        [runId],
      );
    }

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
