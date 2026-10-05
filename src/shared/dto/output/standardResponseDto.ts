export class StandardResponseDto<T> {
  status: 'success' | 'error';
  success: boolean;
  message: string;
  data?: T;
  metadata: any;
  timestamp: string;

  constructor(
    status: 'success' | 'error',
    message: string,
    metadata: any,
    data?: T,
  ) {
    this.status = status;
    this.success = status === 'success';
    this.message = message;
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}
