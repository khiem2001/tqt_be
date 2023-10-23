import { registerEnumType } from '@nestjs/graphql';

//  Todo: User
export enum Gender {
  Unknown = 'UNKNOWN',
  Male = 'MALE',
  Female = 'FEMALE',
}

export enum UserTypes {
  System = 'SYSTEM',
  Creator = 'CREATOR',
  Audience = 'AUDIENCE',
}

export enum ProfileTypes {
  Creator = 'CREATOR',
  Audience = 'AUDIENCE',
}

export enum UserIsActive {
  Active = 'ACTIVE',
  DeActive = 'DEACTIVE',
}

export enum ServiceTypes {
  Password = 'Password',
  Facebook = 'Facebook',
  Google = 'Google',
  Phone = 'Phone',
  Apple = 'Apple',
}

export enum Provider {
  Facebook = 'Facebook',
  Google = 'Google',
  Apple = 'Apple',
}

export enum RolePage {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  ANALYTIC = 'ANALYTIC',
  EDITOR = 'EDITOR',
}

export enum VerifyUserStatus {
  PENDING = 'PENDING',
  REJECT = 'REJECT',
  ACCEPT = 'ACCEPT',
}

export enum UserVerifyType {
  PERSONAL = 'PERSONAL',
  GROUPS = 'GROUPS',
}

registerEnumType(Gender, { name: 'Gender' });
registerEnumType(UserIsActive, { name: 'UserIsActive' });
registerEnumType(UserTypes, { name: 'UserTypes' });
registerEnumType(ServiceTypes, { name: 'ServiceTypes' });
registerEnumType(Provider, { name: 'Provider' });
registerEnumType(RolePage, { name: 'RolePage' });
registerEnumType(VerifyUserStatus, { name: 'VerifyUserStatus' });
registerEnumType(UserVerifyType, { name: 'UserVerifyType' });
