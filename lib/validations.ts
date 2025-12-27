import { z } from 'zod';

// ===========================================
// COMMON VALIDATION PATTERNS
// ===========================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number');

export const usPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    'Please enter a valid US phone number'
  );

export const urlSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''));

export const requiredUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL');

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens');

// ===========================================
// PAYMENT SCHEMAS
// ===========================================

export const creditCardSchema = z.object({
  number: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^[\d\s-]+$/, 'Invalid card number')
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => val.length >= 13 && val.length <= 19, 'Card number must be 13-19 digits')
    .refine((val) => luhnCheck(val), 'Invalid card number'),
  expiry: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use format MM/YY')
    .refine((val) => {
      const [month, year] = val.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month), 0);
      return expiry > new Date();
    }, 'Card has expired'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  name: z.string().min(1, 'Cardholder name is required'),
});

export const billingAddressSchema = z.object({
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').max(2, 'Use 2-letter country code'),
});

// ===========================================
// AUTH FORM SCHEMAS
// ===========================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: nameSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// ===========================================
// CONTENT SCHEMAS
// ===========================================

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'support']),
  message: z.string().min(10, 'Please provide more details (at least 10 characters)').max(2000),
  email: emailSchema.optional().or(z.literal('')),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  filters: z.record(z.string()).optional(),
});

// ===========================================
// TYPE EXPORTS
// ===========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get first error message from zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Validation error';
}

/**
 * Validate data and return errors object (for react-hook-form integration)
 */
export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

/**
 * Validate a single field
 */
export function validateField<T extends z.ZodSchema>(
  schema: T,
  value: unknown
): { valid: true; value: z.infer<T> } | { valid: false; error: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true, value: result.data };
  }

  return { valid: false, error: result.error.issues[0]?.message ?? 'Invalid value' };
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Format credit card number for display (masked)
 */
export function formatCardNumber(number: string, mask = true): string {
  const cleaned = number.replace(/\D/g, '');
  if (mask && cleaned.length > 4) {
    return `**** **** **** ${cleaned.slice(-4)}`;
  }
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}
