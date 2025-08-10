import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InvitationsService } from '@src/app/home/data-access/invitations.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  styleUrl: './sidebar.component.scss',
  template: `
    <div class="sidebar">
      <button
        routerLink="/home/chats"
        routerLinkActive="active"
        class="icon-button"
      >
        <i class="fa fa-comments"></i>
      </button>

      <button
        routerLink="/home/invitations"
        routerLinkActive="active"
        class="icon-button"
      >
        <i class="fa fa-envelope"></i>
        @if(invitationsService.receivedInvitations().length > 0) {
        <div class="badge">
          {{ invitationsService.receivedInvitations().length }}
        </div>
        }
      </button>
      <button
        routerLink="/home/profile"
        routerLinkActive="active"
        class="icon-button"
      >
        <i class="fa fa-user"></i>
      </button>
      <button (click)="logout.emit()" class="icon-button logout">
        <i class="fa fa-sign-out"></i>
      </button>
    </div>
  `,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  invitationsService = inject(InvitationsService);

  logout = output<void>();
}
