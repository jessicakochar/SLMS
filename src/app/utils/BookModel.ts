import { TagsModel } from 'src/app/utils/TagsModel';
import { Catalogue } from './catalogueModel';

export class BookModel {
  docId: string;
  fileType: number;
  url: string;
  title: string;
  author: string;
  tags: TagsModel[];
  catalogue: Catalogue[];
  price: number;
  isbn: string;
  available: number;
  issued: number;
}
