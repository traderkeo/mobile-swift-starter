import { getContrastColor, withOpacity } from '../use-theme-color';

// Note: Hook testing requires React testing utilities
// These are unit tests for the utility functions

describe('Theme Color Utilities', () => {
  describe('getContrastColor', () => {
    it('returns black for light backgrounds', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000');
      expect(getContrastColor('#f0f0f0')).toBe('#000000');
      expect(getContrastColor('#cccccc')).toBe('#000000');
    });

    it('returns white for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#333333')).toBe('#ffffff');
      expect(getContrastColor('#0a7ea4')).toBe('#ffffff');
    });

    it('handles hex colors with #', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000');
    });

    it('handles hex colors without #', () => {
      expect(getContrastColor('ffffff')).toBe('#000000');
    });
  });

  describe('withOpacity', () => {
    it('converts hex to rgba with opacity', () => {
      expect(withOpacity('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
      expect(withOpacity('#ffffff', 0.8)).toBe('rgba(255, 255, 255, 0.8)');
    });

    it('handles primary color', () => {
      expect(withOpacity('#0a7ea4', 0.5)).toBe('rgba(10, 126, 164, 0.5)');
    });

    it('handles full opacity', () => {
      expect(withOpacity('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
    });

    it('handles zero opacity', () => {
      expect(withOpacity('#ff0000', 0)).toBe('rgba(255, 0, 0, 0)');
    });

    it('handles colors without #', () => {
      expect(withOpacity('000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    });
  });
});
