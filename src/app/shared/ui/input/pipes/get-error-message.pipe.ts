import { Pipe, PipeTransform, inject } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FORM_ERRORS } from '@app/app.config';

@Pipe({
  name: 'errorMessage',
  standalone: true,
})
export class ErrorMessagePipe implements PipeTransform {
  private formErrors = inject(FORM_ERRORS);

  transform(errors: ValidationErrors): string | null {
    if (!errors) {
      return null;
    }

    const errorKey = Object.keys(errors)[0];

    if (!errorKey || !this.formErrors[errorKey]) {
      return null;
    }

    const errorMessageFormatter = this.formErrors[errorKey];

    return errorMessageFormatter(errors[errorKey]);
  }
}
