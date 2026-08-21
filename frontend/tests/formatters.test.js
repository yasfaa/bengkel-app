import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusBadgeClass,
  buildMotorLabel,
} from '../src/utils/formatters';

describe('Frontend Formatters Utility Tests', () => {
  it('should format currency to Indonesian Rupiah standard format', () => {
    expect(formatCurrency(50000)).toMatch(/50[.,]000/);
    expect(formatCurrency(1250000)).toMatch(/1[.,]250[.,]000/);
    expect(formatCurrency(0)).toBe('0');
    expect(formatCurrency(null)).toBe('0');
  });

  it('should map service statuses to proper badge classes', () => {
    expect(getStatusBadgeClass('Menunggu')).toBe('badge-pending');
    expect(getStatusBadgeClass('Dikerjakan')).toBe('badge-working');
    expect(getStatusBadgeClass('Selesai')).toBe('badge-done');
    expect(getStatusBadgeClass('Unknown')).toBe('');
  });

  it('should build standardized motor label with capacity', () => {
    expect(buildMotorLabel('Honda', 'Beat', '110cc')).toBe('Honda Beat (110cc)');
    expect(buildMotorLabel('Yamaha', 'NMAX', '')).toBe('Yamaha NMAX');
    expect(buildMotorLabel('', 'Vespa', '150cc')).toBe('Vespa (150cc)');
  });

  it('should format valid date string or return fallback', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime('')).toBe('-');
    const formatted = formatDateTime('2026-08-19T08:30:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(5);

    expect(formatDate(null)).toBe('-');
    expect(formatDate('invalid')).toBe('-');
    const dFormatted = formatDate('2026-08-19T08:30:00Z');
    expect(typeof dFormatted).toBe('string');
    expect(dFormatted.length).toBeGreaterThan(5);
  });
});
