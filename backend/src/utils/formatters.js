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

/**
 * Calculates working tenure in human-readable Indonesian text from joining date
 * @param {Date|string} startDate
 * @returns {string}
 */
const calculateTenure = (startDate) => {
  if (!startDate) return '-';
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0 && months > 0) {
    return `${years} thn ${months} bln`;
  }
  if (years > 0) {
    return `${years} tahun`;
  }
  if (months > 0) {
    return `${months} bulan`;
  }
  return 'Baru bergabung (< 1 bln)';
};

module.exports = {
  parseId,
  normalizeText,
  parsePrice,
  buildMotorLabel,
  calculateTenure,
};
