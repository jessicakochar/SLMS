import { Timestamp } from '@angular/fire/firestore';

export class UserSimilar {
  addedOn: Timestamp;
  docId: string;
  faceId: string;
  newUserNumber: number;
  alreadyRegisteredNumber: number;
}
