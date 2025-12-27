import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  nameSchema,
  phoneSchema,
  usPhoneSchema,
  usernameSchema,
  loginSchema,
  signupSchema,
  validateForm,
  validateField,
  formatPhoneNumber,
  formatCardNumber,
} from '../validations';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('accepts valid emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('missing@domain').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('accepts passwords 8+ characters', () => {
      expect(passwordSchema.safeParse('password123').success).toBe(true);
      expect(passwordSchema.safeParse('12345678').success).toBe(true);
    });

    it('rejects short passwords', () => {
      expect(passwordSchema.safeParse('').success).toBe(false);
      expect(passwordSchema.safeParse('short').success).toBe(false);
      expect(passwordSchema.safeParse('1234567').success).toBe(false);
    });
  });

  describe('strongPasswordSchema', () => {
    it('accepts strong passwords', () => {
      expect(strongPasswordSchema.safeParse('Password1').success).toBe(true);
      expect(strongPasswordSchema.safeParse('MyP@ssw0rd').success).toBe(true);
    });

    it('rejects passwords without uppercase', () => {
      const result = strongPasswordSchema.safeParse('password1');
      expect(result.success).toBe(false);
    });

    it('rejects passwords without lowercase', () => {
      const result = strongPasswordSchema.safeParse('PASSWORD1');
      expect(result.success).toBe(false);
    });

    it('rejects passwords without numbers', () => {
      const result = strongPasswordSchema.safeParse('Password');
      expect(result.success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('accepts valid names', () => {
      expect(nameSchema.safeParse('John').success).toBe(true);
      expect(nameSchema.safeParse('Jane Doe').success).toBe(true);
    });

    it('rejects too short names', () => {
      expect(nameSchema.safeParse('').success).toBe(false);
      expect(nameSchema.safeParse('J').success).toBe(false);
    });

    it('rejects too long names', () => {
      const longName = 'A'.repeat(51);
      expect(nameSchema.safeParse(longName).success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('accepts valid phone numbers', () => {
      expect(phoneSchema.safeParse('+14155551234').success).toBe(true);
      expect(phoneSchema.safeParse('14155551234').success).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(phoneSchema.safeParse('').success).toBe(false);
      expect(phoneSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('usPhoneSchema', () => {
    it('accepts various US phone formats', () => {
      expect(usPhoneSchema.safeParse('415-555-1234').success).toBe(true);
      expect(usPhoneSchema.safeParse('(415) 555-1234').success).toBe(true);
      expect(usPhoneSchema.safeParse('415.555.1234').success).toBe(true);
      expect(usPhoneSchema.safeParse('4155551234').success).toBe(true);
    });
  });

  describe('usernameSchema', () => {
    it('accepts valid usernames', () => {
      expect(usernameSchema.safeParse('user123').success).toBe(true);
      expect(usernameSchema.safeParse('user_name').success).toBe(true);
    });

    it('rejects invalid usernames', () => {
      expect(usernameSchema.safeParse('ab').success).toBe(false);
      expect(usernameSchema.safeParse('user@name').success).toBe(false);
      expect(usernameSchema.safeParse('user name').success).toBe(false);
    });
  });
});

describe('Form Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid login data', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('accepts valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password2',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
      }
    });
  });
});

describe('Utility Functions', () => {
  describe('validateForm', () => {
    it('returns success with valid data', () => {
      const result = validateForm(loginSchema, {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('returns errors object with invalid data', () => {
      const result = validateForm(loginSchema, {
        email: 'invalid',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.email).toBeDefined();
        expect(result.errors.password).toBeDefined();
      }
    });
  });

  describe('validateField', () => {
    it('returns valid result for valid field', () => {
      const result = validateField(emailSchema, 'test@example.com');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.value).toBe('test@example.com');
      }
    });

    it('returns error for invalid field', () => {
      const result = validateField(emailSchema, 'invalid');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 10-digit US phone numbers', () => {
      expect(formatPhoneNumber('4155551234')).toBe('(415) 555-1234');
    });

    it('formats 11-digit US phone numbers with country code', () => {
      expect(formatPhoneNumber('14155551234')).toBe('+1 (415) 555-1234');
    });

    it('returns original for other formats', () => {
      expect(formatPhoneNumber('+44123456789')).toBe('+44123456789');
    });
  });

  describe('formatCardNumber', () => {
    it('masks card numbers by default', () => {
      expect(formatCardNumber('4111111111111111')).toBe('**** **** **** 1111');
    });

    it('formats without masking when specified', () => {
      expect(formatCardNumber('4111111111111111', false)).toBe('4111 1111 1111 1111');
    });

    it('handles short card numbers', () => {
      expect(formatCardNumber('1234')).toBe('1234');
    });
  });
});
