import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}
export enum PaymentMethod {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum ShippingStatus {
  SHIPPED = 'SHIPPED',
  SHIPPING = 'SHIPPING',
  NOT_SHIPPED = 'NOT_SHIPPED',
}
export enum PaymentType {
  ATM = 'ATM',
  CC = 'CC',
}

export enum PaymentProvider {
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
registerEnumType(ShippingStatus, { name: 'ShippingStatus' });
registerEnumType(PaymentType, { name: 'PaymentType' });
registerEnumType(PaymentProvider, { name: 'PaymentProvider' });
