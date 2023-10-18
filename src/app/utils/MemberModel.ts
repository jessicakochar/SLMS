import { Timestamp } from "@angular/fire/firestore";
import { IssueModel } from "./IssueModel";
import { SubscriptionModel } from "./subscriptionModel";

export class MemberModel {

  authId: string;
  name: string;
  email: string;
  address: string;
  age: number;
  phone: string;
  password: string;
  userId: string;
  subscription: SubscriptionModel;
  subcollectionData: any[];
  createdOn: Timestamp;
  issueBooks: IssueModel[] = [];
  expiryDate: Timestamp;

  // token: string;
  // password: string;
  // status: boolean;
  // roles: any;
}
