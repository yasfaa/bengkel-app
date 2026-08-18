/**
 * Parses integer ID safely
 * @param {*} value
 * @returns {number|null}
 */
const parseId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Normalizes text string
 * @param {*} value
 * @returns {string}
 */
const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

/**
 * Parses floating price safely
 * @param {*} value
 * @returns {number|null}
 */
const parsePrice = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Builds formatted motor label for frontend display
 * @param {string} brandName
 * @param {string} typeName
 * @param {string} capacityName
 * @returns {string}
 */
const buildMotorLabel = (brandName, typeName, capacityName) => {
  const parts = [brandName, typeName].filter(Boolean);
  const base = parts.join(' ');
  return capacityName ? `${base} (${capacityName})` : base;
};

module.exports = {
  parseId,
  normalizeText,
  parsePrice,
  buildMotorLabel,
};
