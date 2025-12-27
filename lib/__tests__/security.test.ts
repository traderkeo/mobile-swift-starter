import {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  formatLockoutTime,
} from '../security';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      const result = validatePassword('MyStr0ngP@ss');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('rejects short passwords', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('rejects passwords without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('rejects passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('rejects passwords without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('rejects common passwords', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'This password is too common. Please choose a stronger password.'
      );
    });

    it('gives higher score for longer passwords', () => {
      const short = validatePassword('Pass123!');
      const long = validatePassword('MyVeryLongPassword123!');
      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });

    it('gives higher score for special characters', () => {
      const noSpecial = validatePassword('Password123');
      const withSpecial = validatePassword('Password123!');
      expect(withSpecial.score).toBeGreaterThan(noSpecial.score);
    });

    it('penalizes sequential characters', () => {
      const sequential = validatePassword('Abcd1234!');
      expect(sequential.suggestions).toContain('Avoid sequential characters');
    });

    it('penalizes repeating characters', () => {
      const repeating = validatePassword('Passsword123');
      expect(repeating.suggestions).toContain('Avoid repeating characters');
    });

    it('respects custom requirements', () => {
      const result = validatePassword('simple', {
        minLength: 4,
        requireUppercase: false,
        requireNumbers: false,
        minScore: 0,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('returns correct labels', () => {
      expect(getPasswordStrengthLabel(0)).toBe('Very Weak');
      expect(getPasswordStrengthLabel(1)).toBe('Weak');
      expect(getPasswordStrengthLabel(2)).toBe('Fair');
      expect(getPasswordStrengthLabel(3)).toBe('Strong');
      expect(getPasswordStrengthLabel(4)).toBe('Very Strong');
      expect(getPasswordStrengthLabel(5)).toBe('Unknown');
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('returns correct colors', () => {
      expect(getPasswordStrengthColor(0)).toBe('#ef4444');
      expect(getPasswordStrengthColor(1)).toBe('#f97316');
      expect(getPasswordStrengthColor(2)).toBe('#eab308');
      expect(getPasswordStrengthColor(3)).toBe('#22c55e');
      expect(getPasswordStrengthColor(4)).toBe('#16a34a');
    });
  });

  describe('formatLockoutTime', () => {
    it('formats less than a minute', () => {
      expect(formatLockoutTime(30000)).toBe('less than a minute');
    });

    it('formats 1 minute', () => {
      expect(formatLockoutTime(60000)).toBe('1 minute');
    });

    it('formats multiple minutes', () => {
      expect(formatLockoutTime(300000)).toBe('5 minutes');
    });

    it('formats 1 hour', () => {
      expect(formatLockoutTime(3600000)).toBe('1 hour');
    });

    it('formats multiple hours', () => {
      expect(formatLockoutTime(7200000)).toBe('2 hours');
    });
  });
});
