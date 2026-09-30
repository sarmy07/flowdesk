/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import paystackConfig from './config/paystack.config';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaystackService {
  constructor(
    @Inject(paystackConfig.KEY)
    private readonly paystackConfiguration: ConfigType<typeof paystackConfig>,
    private readonly httpService: HttpService,
  ) {}

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
  ) {
    const secret_key = this.paystackConfiguration.paystack_secret_key;

    const baseUrl = this.paystackConfiguration.paystack_base_url;

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100,
          reference,
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }

  async verifyTransaction(reference: string) {
    const secretKey = this.paystackConfiguration.paystack_secret_key;

    const baseUrl = this.paystackConfiguration.paystack_base_url;

    const response = await firstValueFrom(
      this.httpService.get(`${baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }
}
