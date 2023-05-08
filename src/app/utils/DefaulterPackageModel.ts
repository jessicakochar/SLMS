import { Timestamp } from "@angular/fire/firestore";
export class AdminModel {
  active: boolean;
  createdOn: Timestamp;
  noOfDays: number;
  packageCurrency: string;
  defaulterPackageId: string;
  packageName: string;
  packagePrice: number;
  sequence: number;
}
