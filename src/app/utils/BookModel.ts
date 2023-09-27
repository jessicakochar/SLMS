import { TagsModel } from 'src/app/utils/TagsModel';
import { Catalogue } from './catalogueModel';
import { Timestamp } from '@angular/fire/firestore';

export class BookModel {
  bookId: string
  docId: string;
  fileType: number;
  url: string;
  title: string;
  bookTitleArray: string[];
  author: string;
  tags: TagsModel[];
  catalogue: Catalogue[];
  price: number;
  isbn: string;
  total: number;
  issued: number;
  available: number;
  createdOn: Timestamp;
}
