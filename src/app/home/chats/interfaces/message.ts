import { FieldValue, Timestamp } from 'firebase/firestore';

interface BaseMessage {
  id: string;
  authorEmail: string;
  content: string;
}

export interface Message extends BaseMessage {
  timestamp: Date;
}

export interface NewMessage extends Omit<BaseMessage, 'id'> {
  timestamp: FieldValue;
}

export interface GetMessage extends BaseMessage {
  timestamp: Timestamp;
}
