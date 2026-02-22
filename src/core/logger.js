function logInfo(message, meta = {}) {
  console.log(`[INFO] ${new Date().toISOString()} ${message}`, meta);
}

function logWarn(message, meta = {}) {
  console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta);
}

function logError(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}`);
  if (error) console.error(error);
}

module.exports = { logInfo, logWarn, logError };
