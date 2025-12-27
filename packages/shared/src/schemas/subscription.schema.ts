import { z } from 'zod';

export const verifyReceiptSchema = z.object({
  receiptData: z.string().min(1, 'Receipt data is required'),
  productId: z.string().min(1, 'Product ID is required'),
});

export const syncSubscriptionSchema = z.object({
  platform: z.enum(['ios', 'web']),
  transactionId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export type VerifyReceiptInput = z.infer<typeof verifyReceiptSchema>;
export type SyncSubscriptionInput = z.infer<typeof syncSubscriptionSchema>;
