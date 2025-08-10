import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginStatus } from '@app/auth/login/data-access/login.service';
import { ErrorComponent } from '@app/auth/ui/error.component';
import { Credentials } from '@app/shared/interfaces/credentials';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';

@Component({
  standalone: true,
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    ErrorComponent,
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" #form="ngForm">
      <app-input
        formControlName="email"
        type="text"
        label="Email"
        placeholder="email@example.com"
      />

      <app-input formControlName="password" type="password" label="Password" />

      <app-error [text]="error()" />

      <app-button
        type="submit"
        [disabled]="!!form.invalid"
        [loading]="status() === 'authenticating'"
      >
        Submit
      </app-button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  status = input.required<LoginStatus>();
  error = input.required<string | null>();
  submitted = output<Credentials>();

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const status = this.status();

      if (status === 'authenticating') {
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.submitted.emit(this.loginForm.getRawValue());
    }
  }
}
