const db = require("../../config/database");

async function loadUsersToStaging(users) {
  // Auditor Check: Don't process if data is empty
  if (!users || users.length === 0) return;

  console.log(`--- Starting Load Process: ${users.length} records ---`);

  for (const user of users) {
    try {
      // Use Parameterized Query to prevent SQL Injection ($1, $2, etc.)
      const insertQuery = `
        INSERT INTO staging_users (external_id, user_name, user_email, audit_status)
        VALUES ($1, $2, $3, 'LOADED_FROM_API')
        ON CONFLICT (external_id) 
        DO UPDATE SET 
          user_name = EXCLUDED.user_name,
          user_email = EXCLUDED.user_email,
          audit_status = 'UPDATED_FROM_API';
      `;

      const values = [user.id, user.name, user.email];

      await db.query(insertQuery, values);
    } catch (error) {
      // Auditor: Log the specific ID that failed, but don't stop the whole pipeline
      console.error(`⚠️ Failed to load user ID ${user.id}:`, error.message);
    }
  }

  console.log("✅ Loading Phase Complete.");
}

module.exports = { loadUsersToStaging };
