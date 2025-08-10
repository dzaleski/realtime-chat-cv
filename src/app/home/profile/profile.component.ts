import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@app/shared/data-access/auth.service';

@Component({
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent {
  authService = inject(AuthService);
}
