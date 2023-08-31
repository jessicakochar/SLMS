import { Timestamp } from "@angular/fire/firestore";

export class Catalogue {
    name: string;
    catalogueId: string;
    createdOn: Timestamp;
    status: Boolean;
}
