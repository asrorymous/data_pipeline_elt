const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [
    // 1. Write all logs to a file (The Black Box)
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/pipeline.log"),
    }),
    // 2. Also show in console for real-time monitoring
    new winston.transports.Console(),
  ],
});

module.exports = logger;
