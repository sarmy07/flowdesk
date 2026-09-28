import { registerAs } from '@nestjs/config';

export default registerAs('paystack', () => ({
  paystack_secret_key: process.env.PAYSTACK_SECRET_KEY,
  paystack_public_key: process.env.PAYSTACK_PUBLIC_KEY,
  paystack_base_url: process.env.PAYSTACK_BASE_URL,
}));
