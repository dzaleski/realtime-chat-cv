import { FieldValue } from 'firebase/firestore';

export interface Invitation {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: InvitationStatus;
}

export interface SendInvitation extends Omit<Invitation, 'id'> {
  timestamp: FieldValue;
}

export type InvitationStatus = 'pending' | 'accepted';
