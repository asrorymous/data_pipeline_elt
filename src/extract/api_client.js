const axios = require("axios");

async function fetchUsersFromAPI() {
  const API_URL = "https://jsonplaceholder.typicode.com/users";

  try {
    console.log(`--- Initiating API Request to: ${API_URL} ---`);

    const response = await axios.get(API_URL, { timeout: 5000 }); // 5 seconds timeout

    // Auditor Check: Is the data empty or not an array?
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error("AUDIT_FAILURE: Received empty or invalid data format");
    }

    console.log(`✅ Successfully fetched ${response.data.length} records.`);
    return response.data;
  } catch (error) {
    // Detailed logging for Audit Trail
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error(
        `❌ API Error [${error.response.status}]: ${error.response.statusText}`,
      );
    } else if (error.request) {
      // Request was made but no response received (Network issue)
      console.error("❌ Network Error: No response from server.");
    } else {
      console.error("❌ Setup Error:", error.message);
    }
    throw error;
  }
}

module.exports = { fetchUsersFromAPI };
