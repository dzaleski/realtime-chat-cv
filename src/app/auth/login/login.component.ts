import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '@app/auth/login/data-access/login.service';
import { LoginFormComponent } from '@app/auth/login/ui/login-form.component';
import { AuthService } from '@app/shared/data-access/auth.service';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { LinkComponent } from '@app/shared/ui/link.component';

@Component({
  standalone: true,
  styleUrl: './login.component.scss',
  template: `
    <div class="container">
      <app-card>
        <h2 class="title">Login</h2>
        <app-login-form
          [status]="loginService.status()"
          [error]="loginService.error()"
          (submitted)="loginService.login$.next($event)"
        />
        <div class="link-container">
          <app-link routerLink="/auth/register">Create an account</app-link>
        </div>
      </app-card>
    </div>
  `,
  imports: [LoginFormComponent, RouterModule, CardComponent, LinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  authService = inject(AuthService);
  loginService = inject(LoginService);
  router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.authUser()) {
        this.router.navigateByUrl('/home');
      }
    });
  }
}
