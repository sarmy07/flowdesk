/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Request } from 'express';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}
  //
  @Post('paystack')
  @ApiHeader({
    name: 'x-paystack-signature',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        event: 'charge.success',
        data: {
          reference: 'TEST-12345',
          status: 'success',
        },
      },
    },
  })
  handlePaystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // console.log('RAW BODY TYPE:', typeof req.rawBody);
    // console.log('IS BUFFER:', Buffer.isBuffer(req.rawBody));
    // console.log('RAW BODY:', req.rawBody);
    return this.webhooksService.handlePaystackWebhook(
      body,
      signature,
      req.rawBody!,
    );
  }
}
