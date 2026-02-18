const db = require("../../config/database");

async function loadUsersToStaging(users) {
  async function loadUsers(users) {
    if (!users || users.length === 0) {
      console.log("No users to load");
      return;
    }

    const client = await db.connect();

    try {
      console.time("LOAD_TIME");
      await client.query("BEGIN");

      const values = [];
      const placeholders = [];

      users.forEach((user, index) => {
        const base = index * 4;

        placeholders.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`,
        );

        values.push(user.id, user.name, user.email, new Date());
      });

      const query = `
      INSERT INTO staging_users 
      (external_id, user_name, user_email, extracted_at)
      VALUES ${placeholders.join(",")}
    `;

      await client.query(query, values);

      await client.query("COMMIT");
      console.timeEnd("LOAD_TIME");

      console.log(`Loaded ${users.length} users`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Load failed:", err.message);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = { loadUsersToStaging };
