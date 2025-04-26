import sgMail from '@sendgrid/mail';

/**
 * Configure SendGrid with API key
 */
export function setupSendgrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY is not set. Email functionality will be limited.');
    return false;
  }
  
  try {
    sgMail.setApiKey(apiKey);
    return true;
  } catch (error) {
    console.error('Failed to set SendGrid API key:', error);
    return false;
  }
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail({
  to,
  subject,
  text,
  html
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM || 'noreply@slynkapp.com';
  
  const msg = {
    to,
    from,
    subject,
    text, 
    html,
  };
  
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format a nice HTML email for magic link authentication
 */
export function formatVerificationEmail(email: string, url: string) {
  const appName = 'Slynk AI';
  const brandColor = '#FF53A5'; // Pink color used in the app
  
  // Text version
  const text = `Sign in to ${appName}\n\nClick the link below to sign in to your account:\n${url}\n\nIf you did not request this email, you can safely ignore it.`;
  
  // HTML version
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${brandColor}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">${appName}</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Click the button below to sign in to your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: ${brandColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Sign In</a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="font-size: 14px; color: #666; word-break: break-all;">
          <a href="${url}" style="color: ${brandColor};">${url}</a>
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">If you did not request this email, you can safely ignore it.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { text, html };
} 