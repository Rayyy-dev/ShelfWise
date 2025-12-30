interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Development mode: log to console
  console.log('\n' + '='.repeat(50));
  console.log('📧 EMAIL');
  console.log('='.repeat(50));
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log('-'.repeat(50));
  console.log(options.text);
  console.log('='.repeat(50) + '\n');
  return true;
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Verify your ShelfWise account',
    text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't create an account, please ignore this email.`,
  });
}
