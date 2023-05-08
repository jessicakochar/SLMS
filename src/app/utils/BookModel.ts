import { TagsModel } from 'src/app/utils/TagsModel';
export class BookModel {
  docId: string;
  fileType: number
  url: string;
  title: string;
  author: string;
  tags: TagsModel[];
  price: number;
  isbn: string;
  available: number;
  issued: number;
}
