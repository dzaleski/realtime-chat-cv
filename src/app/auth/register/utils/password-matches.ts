import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatches: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const passwordValue = control.get('password')?.value;
  const confirmPasswordValue = control.get('confirmPassword')?.value;

  if (
    passwordValue &&
    confirmPasswordValue &&
    passwordValue !== confirmPasswordValue
  ) {
    return { passwordMatches: true };
  }

  return null;
};
