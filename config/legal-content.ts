/**
 * In-App Legal Content
 *
 * This file contains the Privacy Policy and Terms of Service content
 * that will be displayed within the app. Edit these to match your app's
 * specific data practices and terms.
 *
 * IMPORTANT: These are templates. You should review and customize them
 * for your specific app before submitting to the App Store.
 */

export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/**
 * Privacy Policy Content
 *
 * Customize this for your app's specific data collection and usage practices.
 * Key areas to update:
 * - App name and company name
 * - What data you actually collect
 * - Third-party services you use (RevenueCat, etc.)
 * - Contact information
 */
export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'December 2024',
  sections: [
    {
      title: 'Introduction',
      content: `Welcome to our app. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.

By using our app, you agree to the collection and use of information in accordance with this policy.`,
    },
    {
      title: 'Information We Collect',
      content: `We collect several types of information to provide and improve our service:

**Account Information**
• Email address (for account creation and communication)
• Name (optional, for personalization)

**Usage Data**
• App usage patterns and feature interactions
• Device information (device type, operating system)
• Anonymous analytics data

**Payment Information**
• Subscription status and history
• Purchase receipts (processed by Apple/Google)
• We do NOT store credit card numbers or payment details`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the collected information for:

• **Providing Services**: To deliver app functionality and features
• **Account Management**: To manage your account and subscriptions
• **Improvements**: To analyze usage and improve the app experience
• **Communication**: To send important updates about your account
• **Support**: To respond to your requests and provide customer support
• **Security**: To detect and prevent fraud or abuse`,
    },
    {
      title: 'Third-Party Services',
      content: `Our app uses trusted third-party services:

**RevenueCat** (Subscription Management)
• Processes in-app purchases
• Privacy Policy: https://www.revenuecat.com/privacy

**Apple/Google** (App Stores)
• Handles payment processing
• Subject to their respective privacy policies`,
    },
    {
      title: 'Data Security',
      content: `We implement robust security measures:

• **Encryption**: All data is encrypted in transit (TLS/SSL) and at rest
• **Secure Storage**: Sensitive tokens are stored in device secure storage (Keychain/Keystore)
• **Access Controls**: Strict access controls limit who can access your data
• **Regular Audits**: We regularly review and update our security practices

While we strive to protect your data, no method of transmission over the internet is 100% secure.`,
    },
    {
      title: 'Data Retention',
      content: `We retain your data only as long as necessary:

• **Account Data**: Retained while your account is active
• **Usage Analytics**: Aggregated data may be retained for analysis
• **Deleted Accounts**: Data is permanently deleted within 30 days of account deletion

You can request deletion of your data at any time through the app settings.`,
    },
    {
      title: 'Your Rights',
      content: `You have the following rights regarding your data:

• **Access**: Request a copy of your personal data
• **Correction**: Update or correct inaccurate data
• **Deletion**: Delete your account and associated data
• **Export**: Download your data in a portable format
• **Opt-out**: Disable analytics and non-essential data collection

To exercise these rights, use the settings in the app or contact our support team.`,
    },
    {
      title: "Children's Privacy",
      content: `Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.`,
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this privacy policy periodically. We will notify you of any material changes by:

• Posting the new policy in the app
• Updating the "Last Updated" date
• Sending an email notification for significant changes

We encourage you to review this policy periodically.`,
    },
    {
      title: 'Contact Us',
      content: `If you have questions about this privacy policy or your data, please contact us:

• **Email**: support@example.com
• **In-App**: Settings > Contact Support

We aim to respond to all inquiries within 48 hours.`,
    },
  ],
};

/**
 * Terms of Service Content
 *
 * Customize this for your app's specific terms and conditions.
 * Key areas to update:
 * - App name and company name
 * - Subscription terms and pricing
 * - Prohibited uses specific to your app
 * - Contact information
 */
export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  lastUpdated: 'December 2024',
  sections: [
    {
      title: 'Agreement to Terms',
      content: `By accessing or using our app, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not use our app.

These terms apply to all users, including visitors, registered users, and subscribers.`,
    },
    {
      title: 'Account Registration',
      content: `To use certain features, you must create an account. You agree to:

• Provide accurate and complete information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      title: 'Subscriptions and Payments',
      content: `Our app offers subscription-based premium features:

**Billing**
• Subscriptions are billed through Apple App Store or Google Play Store
• Prices are displayed in your local currency before purchase
• Payment is charged to your App Store/Play Store account

**Auto-Renewal**
• Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period
• Your account will be charged for renewal within 24 hours prior to the end of the current period

**Cancellation**
• You can cancel your subscription at any time through your device's subscription settings
• Cancellation takes effect at the end of the current billing period
• No refunds are provided for partial subscription periods

**Price Changes**
• We may change subscription prices with advance notice
• Price changes will apply to the next billing cycle after notice`,
    },
    {
      title: 'Free Trial',
      content: `If offered, free trials are subject to these terms:

• Free trials automatically convert to paid subscriptions unless cancelled
• You must cancel at least 24 hours before the trial ends to avoid charges
• Free trials are limited to one per account/device
• We reserve the right to modify or discontinue free trials`,
    },
    {
      title: 'Acceptable Use',
      content: `You agree NOT to use the app to:

• Violate any laws or regulations
• Infringe on intellectual property rights
• Harass, abuse, or harm others
• Distribute malware or harmful code
• Attempt to gain unauthorized access to our systems
• Reverse engineer or copy the app
• Use automated systems to access the app
• Share account credentials with others

Violation of these terms may result in immediate termination.`,
    },
    {
      title: 'Intellectual Property',
      content: `The app and its content are protected by intellectual property laws:

• The app, including its design, features, and content, is owned by us
• You receive a limited, non-exclusive license to use the app for personal purposes
• You may not copy, modify, distribute, or create derivative works
• All trademarks and logos are our property

User-generated content remains your property, but you grant us a license to use it within the app.`,
    },
    {
      title: 'Disclaimer of Warranties',
      content: `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

We disclaim all warranties, express or implied, including:
• Merchantability
• Fitness for a particular purpose
• Non-infringement
• Uninterrupted or error-free operation

We do not guarantee that the app will meet your specific requirements or expectations.`,
    },
    {
      title: 'Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• We are not liable for indirect, incidental, special, or consequential damages
• Our total liability is limited to the amount you paid us in the 12 months before the claim
• We are not liable for third-party actions or content

Some jurisdictions do not allow these limitations, so they may not apply to you.`,
    },
    {
      title: 'Indemnification',
      content: `You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:

• Your use of the app
• Your violation of these terms
• Your violation of any third-party rights
• Content you submit to the app`,
    },
    {
      title: 'Changes to Terms',
      content: `We may modify these terms at any time. When we make changes:

• We will update the "Last Updated" date
• We will notify you of material changes via email or in-app notification
• Continued use of the app constitutes acceptance of the new terms

If you disagree with changes, you must stop using the app.`,
    },
    {
      title: 'Termination',
      content: `We may terminate or suspend your access to the app:

• For violation of these terms
• For fraudulent or illegal activity
• At our discretion with reasonable notice

Upon termination:
• Your right to use the app ceases immediately
• We may delete your data as described in our Privacy Policy
• Provisions that should survive termination will remain in effect`,
    },
    {
      title: 'Governing Law',
      content: `These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].

For EU users: You may also be entitled to use the EU Online Dispute Resolution platform.`,
    },
    {
      title: 'Contact Information',
      content: `For questions about these terms, please contact us:

• **Email**: support@example.com
• **In-App**: Settings > Contact Support

We aim to respond to all inquiries within 48 hours.`,
    },
  ],
};

/**
 * FAQ Content (Optional)
 *
 * Common questions users might have about the app
 */
export const FAQ_CONTENT: LegalDocument = {
  title: 'Frequently Asked Questions',
  lastUpdated: 'December 2024',
  sections: [
    {
      title: 'How do I cancel my subscription?',
      content: `You can cancel your subscription at any time:

**On iOS:**
1. Open Settings on your device
2. Tap your name at the top
3. Tap Subscriptions
4. Select our app
5. Tap Cancel Subscription

**On Android:**
1. Open the Google Play Store
2. Tap Menu > Subscriptions
3. Select our app
4. Tap Cancel subscription

Your premium features will remain active until the end of your current billing period.`,
    },
    {
      title: 'How do I restore my purchases?',
      content: `If you've previously subscribed and your premium features aren't showing:

1. Go to Settings in the app
2. Tap "Restore Purchases"
3. Sign in with your Apple ID or Google account when prompted

Your subscription should be restored within a few moments.`,
    },
    {
      title: 'How do I delete my account?',
      content: `To permanently delete your account and all associated data:

1. Go to Settings in the app
2. Scroll to the Account section
3. Tap "Delete Account"
4. Confirm your decision

This action is irreversible. All your data will be permanently deleted.`,
    },
    {
      title: 'Is my data secure?',
      content: `Yes! We take your privacy seriously:

• All data is encrypted in transit and at rest
• Sensitive information is stored in your device's secure storage
• We never store your payment information
• You can request a copy of your data or delete it at any time

See our Privacy Policy for more details.`,
    },
    {
      title: 'How do I contact support?',
      content: `You can reach our support team:

• **In-App**: Settings > Contact Support
• **Email**: support@example.com

We typically respond within 24-48 hours.`,
    },
  ],
};
