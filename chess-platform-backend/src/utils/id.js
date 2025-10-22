function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

module.exports = { generateClientId };
