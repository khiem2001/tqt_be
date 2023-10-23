import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'phone', async: false })
export class PhoneValidator implements ValidatorConstraintInterface {
  validate(value: string, validationArguments?: ValidationArguments) {
    const phoneRegExp = /^(?:\+84|0)(?:\d{9}|\d{10})$/;
    return phoneRegExp.test(value);
  }
  defaultMessage(validationArguments?: ValidationArguments) {
    return `Số điện thoại không hợp lệ`;
  }
}
