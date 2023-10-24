import { registerEnumType } from '@nestjs/graphql';

export enum ConversationType {
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
}
export enum ConfirmationStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

registerEnumType(ConversationType, { name: 'ConversationType' });
registerEnumType(ConfirmationStatus, { name: 'ConfirmationStatus' });
