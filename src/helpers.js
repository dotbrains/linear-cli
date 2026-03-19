const https = require("https");

const STATUS_HOST = "constellation.linear.app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function httpGet(host, path) {
  return new Promise((resolve, reject) => {
    https
      .get({ host, path }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString();
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
          } else {
            resolve(raw);
          }
        });
      })
      .on("error", reject);
  });
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

module.exports = { STATUS_HOST, httpGet, printJson };
