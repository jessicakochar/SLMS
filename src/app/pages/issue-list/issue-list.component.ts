// import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { privateDecrypt } from 'crypto';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from 'src/app/utils/BookModel';

@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  booksSub: Subscription;
  booksList: BookModel[] = [];
  form: FormGroup;
  selectedISBN: string = '';
  searchForm = new FormGroup({
    param: new FormControl(''),
    phoneNumber: new FormControl('')
  });
  filteredData: BookModel[] = [];
  tempBookList: BookModel[] = [];
  issuedBooksList: BookModel[] = [];


  constructor(
    private db: DbService,
    private fb: FormBuilder,
    private firestore: Firestore,
    // private af: AngularFirestore,
    private toast: ToastrService,
  ) {
    this.searchForm = this.fb.group({
      phoneNumber: [''],
      param: [''],
    });
  }

  ngOnInit(): void {

    this.db.getBooksList();
    this.booksSub = this.db.booksSub.subscribe((list) => {
      if (list.length !== 0) {
        this.booksList = [...list];
      }
    })
    this.tempBookList = [...this.booksList];
    this.filteredData = [...this.booksList];
  }


  // initializeForm(obj: TagsModel = null) {
  //   if (obj === null) {
  //     this.searchForm = this.fb.group({
  //       // tagID: [doc(collection(this.db.firestore, TAGS_COLLECTION)).id],
  //       phone: [null],
  //       description: [null],
  //       active: [true],
  //       createdOn: [Timestamp.now()],
  //     });
  //   } else {
  //     this.searchForm = this.fb.group({
  //       tagID: [obj.tagID],
  //       name: [obj.name],
  //       description: [obj.description],
  //       active: [obj.active],
  //       createdOn: [obj.createdOn],
  //     });
  //   }
  // }

  filterBooksByISBN() {
    this.selectedISBN = this.searchForm.controls.param.value;
    this.db.booksRetrievedBool = false
    this.db.getBooksByISBN(this.searchForm.controls.param.value);
    // console.log("nopee");
    this.filteredData = this.booksList.filter(book => book.isbn === this.selectedISBN);
  }

  issueBook(book: BookModel) {
    const alreadyIssued = this.issuedBooksList.find(issuedBook => issuedBook.isbn === book.isbn);

    if (!alreadyIssued) {
      this.issuedBooksList.push(book);
    }
    console.log(this.issuedBooksList);
  }

  async saveDataToFirestore() {
    if (this.searchForm.valid) {
      const phoneNumber = this.searchForm.get('phoneNumber').value;
      // const validity = this.searchForm.get('validity').value;
      const userCollectionRef = collection(this.firestore, 'users');
      const userQueryRef = query(userCollectionRef, where('phone', '==', phoneNumber));
      // const validityQueryRef = query(userCollectionRef, where('validity', '==', validity));

      try {
        const userQuerySnapshot = await getDocs(userQueryRef);

        if (!userQuerySnapshot.empty) {
          const userDoc = userQuerySnapshot.docs[0];
          const userId = userDoc.id;
          const userName = userDoc.data().name;
          const validity = userDoc.data().subscription.validity;

          const issuedBookData = this.issuedBooksList.map((book) => {
            const { title, isbn, docId } = book;
            // const issueDate = Timestamp.now();
            const issueDate = new Date();
            const returnDate = new Date(
              issueDate.getFullYear(),
              issueDate.getMonth(),
              issueDate.getDate() + validity
            )

            return { title, isbn, docId, issueDate, returnDate, memberId: userId, memberName: userName, phoneNumber };
          });

          const docRef = doc(collection(this.db.firestore, 'users'), userId);
          const colRef = collection(docRef, 'issuedBooks');

          for (const book of issuedBookData) {
            const docId = doc(colRef).id;
            const bookDocRef = doc(colRef, docId);

            await setDoc(bookDocRef, { ...book, docId: docId }, { merge: true });
          }

          this.toast.success("Books Saved Successfully", "");
        } else {
          this.toast.warning("User with this phone number not found.", "");
        }
      } catch (error) {
        console.error('Error saving data to Firestore:', error);
        this.toast.warning("Something went wrong! Please try again.", "");
      }
    }
  }


  // async saveDataToFirestore() {
  //   if (this.searchForm.valid) {
  //     const phoneNumber = this.searchForm.get('phoneNumber').value;
  //     let userId = '';
  //     const userCollectionRef = collection(this.firestore, 'users');
  //     const userDocRef = query(userCollectionRef, where('phone', '==', phoneNumber));
  //     getDocs(userDocRef)
  //       .then((response) => {
  //         userId = response.docs[0].id;

  //         const issuedBookData = this.issuedBooksList.map((book) => {
  //           const { title, isbn, docId,  } = book;
  //           const createdOn = Timestamp.now();

  //           return { title, isbn, docId, createdOn };
  //         })

  //         let docRef = doc(collection(this.db.firestore, 'users'), userId);
  //         const colRef = collection(docRef, 'issuedBooks');

  //         issuedBookData.forEach((book) => {
  //           let docId = doc(colRef).id;
  //           let bookDocRef = doc(colRef, docId);
  //           // this.issuedBooksList.forEach((book) => {
  //           //   let docId = doc(colRef).id
  //           //   let bookDocRef = doc(colRef, docId);

  //           setDoc(bookDocRef, { ...book, docId: docId }, { merge: true })
  //             .then(() => {
  //               this.toast.success("Book Saved Successfully", "")
  //             }, (error) => {
  //               this.toast.warning("Something went wrong! Please try again.", "");
  //             });
  //         })

  //       })
  //   }
  // }

}



