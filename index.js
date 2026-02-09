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
  }
  // Catatan Auditor: Kita tidak menutup pool.end() di sini
  // agar koneksi tetap standby untuk jadwal berikutnya.
}

// Export fungsinya agar bisa dibaca scheduler.js
module.exports = { runPipeline };

// Jika file ini dijalankan manual (node index.js), tetap jalan
if (require.main === module) {
  runPipeline()
    .then(() => {
      logger.info("Pipeline finished, closing process.");
      process.exit(0); // Memberitahu GitHub bahwa tugas selesai dengan sukses
    })
    .catch((err) => {
      logger.error("Pipeline failed: " + err.message);
      process.exit(1); // Memberitahu GitHub bahwa tugas gagal
    });
}
