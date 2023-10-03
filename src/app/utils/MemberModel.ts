import { Timestamp } from "@angular/fire/firestore";
import { IssueModel } from "./IssueModel";

export class MemberModel {

  authId: string;
  name: string;
  email: string;
  address: string;
  age: string;
  phone: string;
  password: string;
  userId: string;
  subscription: string;
  subcollectionData: any[];
  createdOn: Timestamp
  issueBooks: IssueModel[] = [];

  // token: string;
  // password: string;
  // status: boolean;
  // roles: any;
}
