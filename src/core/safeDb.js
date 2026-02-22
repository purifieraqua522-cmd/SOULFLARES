const { logError } = require('./logger');

async function safeDb(call, context) {
  const { data, error } = await call;
  if (error) {
    logError(`DB error in ${context}`, error);
    throw new Error(`Database failure: ${context}`);
  }
  return data;
}

module.exports = { safeDb };
