import { registerDecorator, ValidationOptions } from 'class-validator';
import { ConfirmPasswordValidator } from '../validator/confirm-password.validator';

export function ConfirmPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: ConfirmPasswordValidator,
    });
  };
}
