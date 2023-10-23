import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'confirmPassword', async: false })
export class ConfirmPasswordValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    // return `${relatedPropertyName} and confirm password do not match`;
    return `Xác nhận mật khẩu không chính xác`;
  }
}
