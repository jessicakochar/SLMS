// import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FieldValue, Firestore, Timestamp, addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, increment, getFirestore, onSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { privateDecrypt } from 'crypto';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from 'src/app/utils/BookModel';
import { MemberModel } from 'src/app/utils/MemberModel';
import { BOOKS_COLLECTION } from 'src/app/utils/constants';

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
    selectedIsbn: new FormControl(''),
    phoneNumber: new FormControl('')
  });
  filteredData: BookModel[] = [];
  tempBookList: BookModel[] = [];
  issuedBooksList: BookModel[] = [];
  userData: MemberModel;
  memberData: MemberModel[] = [];
  bookData: BookModel[] = [];
  numberParam: string = '';
  phoneNumber: string = '';
  bookModal: BookModel;
  booksRetrievedBool: boolean = false;

  constructor(
    private db: DbService,
    private fb: FormBuilder,
    private firestore: Firestore,
    private toast: ToastrService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.searchForm = this.fb.group({
      phoneNumber: [''],
      selectedIsbn: [''],
    });
  }

  ngOnInit(): void {

    // this.db.getBooksList();
    // this.booksSub = this.db.booksSub.subscribe((list) => {
    //   if (list.length !== 0) {
    //     this.booksList = [...list];
    //   }
    // })
    // this.tempBookList = [...this.booksList];
    // this.filteredData = [...this.booksList];
  }

  // async fetchBooksByISBN() {
  //   const isbn = this.searchForm.get('isbn').value;
  //   let collectionRef = collection(this.firestore, BOOKS_COLLECTION);
  //   let queryRef = query(collectionRef, where("isbn", "==", isbn));
  //   const userQuerySnapshot = await getDocs(queryRef);
  //   // Make sure 'Books' is the correct collection name in your Firestore database

  // }

  async getBookByISBN(selectedIsbn: string) {

    const firestore = getFirestore();
    try {
      const userCollectionRef = collection(firestore, 'Books');
      const userQueryRef = query(userCollectionRef, where('isbn', '==', selectedIsbn));
      const userQuerySnapshot = await getDocs(userQueryRef);
      if (!userQuerySnapshot.empty) {
        const reqData = userQuerySnapshot.docs[0].data() as BookModel;
        this.filteredData.push(reqData);
        console.log(this.bookData);
      } else {
        this.toast.error('Book not Found', 'Wrong ISBN');
        console.log('Book not found with ISBN:', selectedIsbn);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  }



  async onPhoneNumberChange(phoneNumber: string) {
    if (phoneNumber.length === 10) {
      const firestore = getFirestore();

      try {
        const userCollectionRef = collection(firestore, 'users');
        const userQueryRef = query(userCollectionRef, where('phone', '==', phoneNumber));
        const userQuerySnapshot = await getDocs(userQueryRef);

        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data() as MemberModel;
          this.memberData.push(userData);
          // console.log('Data:', this.memberData);
        } else {
          this.toast.error('Member not Found', 'Wrong Number');
          console.log('User not found with phone number:', phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      // Optionally, you can clear the memberData or handle other cases when phone number doesn't have 10 digits.
    }
  }




  // filterBooksByISBN() {
  //   this.selectedISBN = this.searchForm.controls.param.value;
  //   this.db.booksRetrievedBool = false
  //   this.db.getBooksByISBN(this.searchForm.controls.param.value);
  //   // console.log("nopee");
  //   this.filteredData = this.booksList.filter(book => book.isbn === this.selectedISBN);
  // }

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
          const issuePeriod = userDoc.data().subscription.issuePeriod;

          const issuedBookData = this.issuedBooksList.map((book) => {
            const { title, isbn, docId, bookId } = book;
            // const issueDate = Timestamp.now();
            const issueDate = new Date();
            const dueDate = new Date(
              issueDate.getFullYear(),
              issueDate.getMonth(),
              issueDate.getDate() + issuePeriod
            );
            // const returnDate = null;

            return { title, isbn, docId, bookId, issueDate, dueDate, memberId: userId, memberName: userName, phoneNumber };
          });

          const docRef = doc(collection(this.db.firestore, 'users'), userId);
          const colRef = collection(docRef, 'issuedBooks');

          const datepipe = new DatePipe('en-US')
          for (const book of issuedBookData) {
            const docId = doc(colRef).id;
            const bookDocRef = doc(colRef, docId);

            const today = datepipe.transform(new Date(), 'yyyyMMdd');

            await setDoc(bookDocRef, { ...book, docId: docId }, { merge: true });
            await updateDoc(doc(this.firestore, `Books/${book.bookId}`), {
              issued: increment(1)
            })
            await setDoc(
              doc(this.firestore, `Books/${book.bookId}/monthlyBookStats/${datepipe.transform(new Date(), 'yyyyMM')}`),
              { issued: increment(1) },
              { merge: true }
            )

            await setDoc(
              doc(this.firestore, `Books/${book.bookId}/monthlyBookStats/${datepipe.transform(new Date(), 'yyyyMM')}/dailyBookStats/${datepipe.transform(new Date(), 'yyyyMMdd')}`),
              { issued: increment(1) },
              { merge: true }
            )

            await setDoc(
              doc(this.firestore, `globalStats/${datepipe.transform(new Date(), 'yyyyMM')}`),
              { issued: increment(1) },
              { merge: true }
            );

            // await setDoc(
            //   doc(this.firestore, `globalStats/dailyStats`),
            //   { issued: increment(1) },
            //   { merge: true }
            // )
            // const bookColRef = collection(this.db.firestore, 'Books');
            // const bookQueryRef = query(bookColRef, where('bookId', '==', book.bookId));
            // const bookQuerySnapshot = await getDocs(bookQueryRef);

            //   // Create a reference to the "bookStats" subcollection
            //   const bookStatsRef = collection(bookDoc.ref, 'bookStats');
            //   const bookStatsDocRef = doc(bookStatsRef, bookStatsDocId, 'bookStats');
          }

          this.toast.success("Books Saved Successfully", "");

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`; // Add leading zero if necessary
          const userStatsDocId = `${currentYear}${formattedMonth}`;

          const userStatsRef = collection(doc(collection(this.db.firestore, 'users'), userId), 'userStats');
          const userStatsDocRef = doc(userStatsRef, userStatsDocId);

          const userStatsDocSnapshot = await getDoc(userStatsDocRef);

          if (userStatsDocSnapshot.exists()) {
            // If the document already exists, update its fields
            const userStatsData = userStatsDocSnapshot.data();
            const booksIssued = userStatsData.booksIssued + issuedBookData.length;
            // const booksReturned = userStatsData.booksReturned; // You need to calculate this

            await setDoc(userStatsDocRef, { booksIssued }, { merge: true });
          } else {
            // If the document doesn't exist, create a new one
            const booksIssued = issuedBookData.length;
            // const booksReturned = 0;

            await setDoc(userStatsDocRef, { booksIssued });
          }

        } else {
          this.toast.warning("User with this phone number not found.", "");
        }
      } catch (error) {
        console.error('Error saving data to Firestore:', error);
        this.toast.warning("Something went wrong! Please try again.", "");
      }
    }
  }

  removeBook(index: number): void {
    this.issuedBooksList.splice(index, 1);
    console.log(this.issuedBooksList);
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



