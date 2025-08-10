import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/shared/data-access/auth.service';
import { SidebarComponent } from '@app/shared/ui/sidebar/sidebar.component';
import { ChatsService } from './data-access/chats.service';
import { InvitationsService } from './data-access/invitations.service';
import { MessagesService } from './data-access/messages.service';
import { PeopleService } from './data-access/people.service';

@Component({
  standalone: true,
  styles: `
    :host {
      display: flex;
      height: 100vh;
    }

    .content {
      flex: 1;
      width: calc(100vw - 55px);
      overflow: auto;
    }
  `,
  template: `
    <app-sidebar (logout)="authService.logout()" />
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  providers: [InvitationsService, ChatsService, PeopleService, MessagesService],
  imports: [RouterModule, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);

  constructor() {
    effect(() => {
      if (!this.authService.authUser()) {
        this.router.navigate(['auth', 'login']);
      }
    });
  }
}
