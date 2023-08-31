import { Timestamp } from "@angular/fire/firestore";
import { BlobOptions } from "buffer";

export class TagsModel {
    tagID: string;
    name: string;
    description: string;
    active: boolean;
    createdOn: Timestamp;
}
