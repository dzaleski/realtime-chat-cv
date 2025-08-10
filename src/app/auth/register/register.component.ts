import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterService } from '@app/auth/register/data-access/register.service';
import { RegisterFormComponent } from '@app/auth/register/ui/register-form.component';
import { AuthService } from '@app/shared/data-access/auth.service';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { LinkComponent } from '@app/shared/ui/link.component';

@Component({
  standalone: true,
  styleUrl: './register.component.scss',
  template: `
    <div class="container">
      <app-card>
        <h2 class="title">Register</h2>
        <app-register-form
          [status]="registerService.status()"
          [error]="registerService.error()"
          (submitted)="registerService.createAccount$.next($event)"
        />
        <div class="link-container">
          <app-link routerLink="/auth/login">Go back to login</app-link>
        </div>
      </app-card>
    </div>
  `,
  imports: [RegisterFormComponent, CardComponent, RouterLink, LinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  registerService = inject(RegisterService);

  constructor() {
    effect(() => {
      if (this.authService.authUser()) {
        this.router.navigateByUrl('/home');
      }
    });
  }
}
