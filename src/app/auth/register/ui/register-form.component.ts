import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterStatus } from '@app/auth/register/data-access/register.service';
import { passwordMatches } from '@app/auth/register/utils/password-matches';
import { ErrorComponent } from '@app/auth/ui/error.component';
import { RegisterUser } from '@app/shared/interfaces/user';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';

@Component({
  standalone: true,
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    ErrorComponent,
    InputComponent,
    ButtonComponent,
  ],
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" #form="ngForm">
      <app-input
        formControlName="email"
        type="text"
        label="Email"
        placeholder="email@example.com"
      />

      <app-input formControlName="username" type="text" label="Username" />

      <app-input formControlName="password" type="password" label="Password" />

      <app-input
        formControlName="confirmPassword"
        type="password"
        label="Confirm password"
      />

      @if( (form.dirty || form.submitted) && form.hasError('passwordMatches') )
      {
      <app-error text="Passwords don't match" />
      }

      <app-error [text]="error()" />

      <app-button
        type="submit"
        [disabled]="!!form.invalid"
        [loading]="status() === 'creating'"
      >
        Register
      </app-button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);

  status = input.required<RegisterStatus>();
  error = input.required<string | null>();
  submitted = output<RegisterUser>();

  registerForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.email, Validators.required]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { updateOn: 'blur', validators: [passwordMatches] }
  );

  constructor() {
    effect(() => {
      const status = this.status();

      if (status === 'creating') {
        this.registerForm.disable();
      } else {
        this.registerForm.enable();
      }
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { confirmPassword, ...userDetails } =
        this.registerForm.getRawValue();

      this.submitted.emit({
        ...userDetails,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${
          userDetails.email.split('@')[0]
        }`,
      });
    }
  }
}
