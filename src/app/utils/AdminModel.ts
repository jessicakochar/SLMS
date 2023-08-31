import { Timestamp } from "@angular/fire/firestore";
export class AdminModel {
  authId: string;
  adminId: string;
  name: string;
  email: string;
  password: string;
  status: boolean;
  roles: any;
  createdOn: Timestamp;
}
