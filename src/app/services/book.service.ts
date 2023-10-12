// book.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookModel } from '../utils/BookModel';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksSubject = new BehaviorSubject<BookModel[]>([]);
  books$ = this.booksSubject.asObservable();

  setBooks(books: BookModel[]) {
    this.booksSubject.next(books);
  }
}
