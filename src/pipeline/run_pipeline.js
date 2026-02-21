const logger = require("../utils/logger");
const { initializeSchema } = require("../load/schema");
const { fetchUsersFromAPI } = require("../extract/api_client");
const { loadUsersToStaging } = require("../load/loader");
const { transformAndCleanData } = require("../load/transform");
const db = require("../../config/database");

async function runPipeline() {
  logger.info("Starting Data Pipeline Execution...");

  let runId = null;

  try {
    await initializeSchema();

    runId = await createPipelineRun();

    const rawData = await extractStage(runId);

    await loadStage(rawData, runId);

    await transformStage(runId);

    await markSuccess(runId);

    logger.info("🏁 PIPELINE SUCCESS: All stages completed safely.");
  } catch (err) {
    await markFailed(runId);
    logger.error(`💀 PIPELINE FAILED: ${err.message}`);
    throw err;
  }
}

/* =========================
   Stage Functions
========================= */

async function createPipelineRun() {
  const { rows } = await db.query(`
    INSERT INTO pipeline_runs (started_at, status)
    VALUES (NOW(), 'RUNNING')
    RETURNING id
  `);

  const runId = rows[0].id;
  logger.info(`Pipeline Run ID: ${runId}`);
  return runId;
}

async function extractStage(runId) {
  const rawData = await fetchUsersFromAPI();

  await db.query(
    `UPDATE pipeline_runs SET extracted_count = $1 WHERE id = $2`,
    [rawData.length, runId],
  );

  return rawData;
}

async function loadStage(rawData, runId) {
  await loadUsersToStaging(rawData);

  await db.query(`UPDATE pipeline_runs SET loaded_count = $1 WHERE id = $2`, [
    rawData.length,
    runId,
  ]);
}

async function transformStage(runId) {
  const affectedRows = await transformAndCleanData();

  await db.query(
    `UPDATE pipeline_runs SET transformed_count = $1 WHERE id = $2`,
    [affectedRows || 0, runId],
  );
}

async function markSuccess(runId) {
  await db.query(
    `UPDATE pipeline_runs 
     SET status = 'SUCCESS', finished_at = NOW()
     WHERE id = $1`,
    [runId],
  );
}

async function markFailed(runId) {
  if (!runId) return;

  await db.query(
    `UPDATE pipeline_runs 
     SET status = 'FAILED', finished_at = NOW()
     WHERE id = $1`,
    [runId],
  );
}

module.exports = { runPipeline };
