import { Timestamp } from '@angular/fire/firestore';

export class MediaModel {
    docId: string;
    fileType: number;  // 0 -> images | 1 -> text content | 2 -> documents | 3 -> videos | 4-> link
    url: string;
    videoUrl: string;
    title: string;
    description: string;
    createdOn: Timestamp;
    updatedOn: Timestamp;
    isActive: boolean;
}
