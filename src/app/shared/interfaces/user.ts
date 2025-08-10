import { InvitationStatus } from '@app/shared/interfaces/invitation';

export interface UserDetails {
  username: string;
  email: string;
  avatarUrl: string;
}

export interface RegisterUser extends Omit<UserDetails, 'userId'> {
  password: string;
}

export interface SearchResultUser extends UserDetails {
  inviteStatus?: InvitationStatus;
}
