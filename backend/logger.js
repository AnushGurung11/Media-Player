const winston = require("winston");
const LokiTransport = require("winston-loki");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new LokiTransport({
      host: "http://localhost:3100",
      labels: { app: "mern-backend" },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err) => console.error("Loki connection error:", err),
    }),
  ],
});

module.exports = logger;