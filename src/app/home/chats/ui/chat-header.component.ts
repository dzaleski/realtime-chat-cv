import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserDetails } from '@src/app/shared/interfaces/user';

@Component({
  standalone: true,
  selector: 'app-chat-header',
  styleUrl: './chat-header.component.scss',
  template: `
    <div class="chat-avatar">
      <img [src]="user().avatarUrl" [alt]="user().username + ' avatar'" />
    </div>

    <div class="chat-name-email">
      <div class="chat-name">{{ user().username }}</div>
      <div class="chat-email">{{ user().email }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHeaderComponent {
  user = input.required<UserDetails>();
}
