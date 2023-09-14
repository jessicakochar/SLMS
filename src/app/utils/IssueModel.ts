import { Timestamp } from "@angular/fire/firestore";

export class IssueModel {

    name: string;
    bookName: string;
    userId: string;
    createdOn: Timestamp;
}
