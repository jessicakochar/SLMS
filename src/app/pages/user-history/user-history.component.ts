import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData, Firestore, Timestamp, collection, doc, getDocs, getFirestore, increment, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from 'src/app/utils/BookModel';
import { IssueModel } from 'src/app/utils/IssueModel';
import { MemberModel } from 'src/app/utils/MemberModel';
import { SubscriptionModel } from 'src/app/utils/subscriptionModel';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export class CsvFormat {


  static formatPredictions(members: MemberModel[]): string {
    const csvRows = [];

    members.forEach((member) => {
      const {
        name,
        email,
        address,
        age,
        phone,
        subscription = SubscriptionModel[''],
        subcollectionData,
        issueBooks = IssueModel[''],
      } = member;

      // Create a row for the main member data
      const mainRow = [
        name,
        email,
        address,
        age,
        phone,
        subscription.name,
        "Book Name",
        "Issue Date",
        "Due Date",
        "Return Date"
      ];
      csvRows.push(mainRow.join(','));

      if (subcollectionData && subcollectionData.length > 0) {
        subcollectionData.forEach((subData) => {
          // Create a row for each item in subcollectionData
          const issueBooks = subData.title || ''; // Replace 'title' with the correct property name
          const issueDate = subData.issueDate.toDate();
          const dueDate = subData.dueDate.toDate();
          const returnDate = subData.returnDate.toDate();
          const subRow = [
            '',
            '',
            '',
            '',
            '',
            '',
            issueBooks || '',
            issueDate ? issueDate.getDate() + " " + issueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', weekday: 'long' }) : '',
            dueDate ? dueDate.getDate() + " " + dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', weekday: 'long' }) : '',
            returnDate ? returnDate.getDate() + " " + returnDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', weekday: 'long' }) : '',
          ];

          csvRows.push(subRow.join(','));
        });
      }
    });

    const header =
      'User, Email, Address, Age, Phone, Subscription, Book Data';
    return [header, ...csvRows].join('\n');
  }
}

@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.scss']
})
export class UserHistoryComponent implements OnInit {

  members: MemberModel[] = [];
  memberModel: MemberModel;
  memberModelList: MemberModel[] = [];
  phoneNumber: string = '';
  userData: MemberModel | null = null;
  userDataa: MemberModel[] = [];
  subscription: SubscriptionModel[] = [];
  issuedBooks: IssueModel[] = [];
  @ViewChild('userDataModal') userDataModal: any;
  currentDate: Date = new Date();
  // @ViewChild('submitButton') submitButton: any;
  @ViewChild('submitButton', { read: ElementRef }) submitButton: ElementRef;
  loading: boolean = false;
  BookModal: typeof BookModel;
  // bookReturned: boolean = false;

  constructor(

    private modalService: NgbModal,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private db: DbService,
    private firestore: Firestore,
    private router: Router,
    // private renderer: Renderer2,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      const phoneNumber = params['phone'];
      if (phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.getMembers();
      }
    });
  }

  ngOnInit(): void {
    // this.getTagsList();
    this.getMembers();

    // this.activatedRoute.queryParams.subscribe(params => {
    //   const phoneNumber = params['phone'];
    //   if (phoneNumber) {
    //     this.phoneNumber = phoneNumber;
    //     this.getMembers();
    //   }
    // });

  }

  openConfirmationModal(modal) {
    this.modalService.open(modal, { size: "sm", centered: false });
    this.BookModal = BookModel;
  }

  onPhoneNumberInput() {

    const phoneNumber = this.phoneNumber;

    if (phoneNumber && phoneNumber.length === 10) {
      this.loading = true;
      this.submitButton.nativeElement.click();
      // this.renderer.selectRootElement('#submitButton').click();
    }
  }

  async getMembers() {

    if (!this.phoneNumber || this.phoneNumber.length < 10) {
      // Check if the phoneNumber is not provided or is incomplete
      return;
    }
    const firestore = getFirestore();
    const memberCollectionRef = collection(firestore, 'users');

    const queryRef = query(memberCollectionRef,
      where('phone', '==', this.phoneNumber)
    );
    try {
      const querySnapshot = await getDocs(queryRef);

      if (!querySnapshot.empty) {

        const memberDoc = querySnapshot.docs[0];
        const memberData = memberDoc.data() as MemberModel;

        // Fetch data from the subcollection
        const subCollectionQuerySnapshot = await getDocs(
          query(collection(memberDoc.ref, 'issuedBooks'), orderBy('issueDate', 'desc'))
        );

        memberData.subcollectionData = subCollectionQuerySnapshot.docs.map(subDoc => subDoc.data());

        this.memberModelList = [memberData];
        this.userData = memberData;
        console.log('User data:', this.userData);
        this.loading = false;
      } else {
        this.toastr.warning("No member found", "Add new Member");
        console.log('No user found with phone number:', this.phoneNumber);
        this.memberModelList = [];
        this.userData = null;
        this.loading = false;
      }
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  }

  isMemberActive(createdOn: Date, expiryDate: Date): boolean {
    if (!expiryDate) {
      return true; // No expiryDate, so consider it active.
    }
    const currentDate = new Date();
    return currentDate <= expiryDate;
  }
  getStatusText(createdOn: Date, expiryDate: Date | undefined): string {
    if (!expiryDate) {
      return 'Active';
    }
    const currentDate = new Date();
    return currentDate <= expiryDate ? 'Active' : 'Inactive';
  }

  navigateToOtherUser() {
    this.router.navigate(['/dummy-route'], { skipLocationChange: true }).then(() => {
      this.router.navigate(['/search-user'], { skipLocationChange: true });
    });
  }

  async openConfirmationDialog(book: any) {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    modalRef.componentInstance.additionalMessage = '';

    modalRef.result.then((result) => {
      if (result) {
        // User confirmed, return the book
        this.returnBooks(book);
      }
    });
  }


  async returnBooks(book: any) {
    console.log(book);

    try {
      if (!book.returnDate || book.returnDate == null) {
        await updateDoc(doc(this.firestore, `Books/${book.bookId}`), {
          issued: increment(-1),
        });

        book.bookReturned = true;

        // Set the returnDate property for the specific book to the current date
        // book.returnDate = new D;

        await setDoc(
          doc(this.firestore, `users/${book.memberId}/issuedBooks/${book.docId}`
          ),
          {
            returnDate: Timestamp.now(),
          },
          {
            merge: true
          }
        );

        // Update the "returns" field in the "monthlyBookStats" collection
        const datepipe = new DatePipe('en-US');
        await setDoc(
          doc(
            this.firestore,
            `Books/${book.bookId}/monthlyBookStats/${datepipe.transform(new Date(), 'yyyyMM')}`
          ),
          {
            returns: increment(1),
          },
          { merge: true }
        );

        // Update the "returns" field in the "dailyBookStats" collection for the current date
        const today = datepipe.transform(new Date(), 'yyyyMMdd');
        await setDoc(
          doc(
            this.firestore,
            `Books/${book.bookId}/monthlyBookStats/${datepipe.transform(new Date(), 'yyyyMM')}/dailyBookStats/${today}`
          ),
          {
            returns: increment(1),
          },
          { merge: true }
        );

        await setDoc(
          doc(
            this.firestore,
            `users/${book.memberId}/userStats/${datepipe.transform(new Date(), 'yyyyMM')}`
          ),
          {
            returns: increment(1),
          },
          { merge: true }
        );

        // Update the "returns" field in the "globalStats" collection for the book
        await setDoc(
          doc(this.firestore, `globalStats/${datepipe.transform(new Date(), 'yyyyMM')}`),
          {
            returns: increment(1),
          },
          { merge: true }
        );
        book.bookReturned = true;
      } else {
        this.toastr.info('Book is already returned.', '');
      }
      // Update the "returns" field in the "dailyStats" subcollection under "globalStats" for the current date
      // await updateDoc(
      //   doc(
      //     this.firestore,
      //     `globalStats/${book.bookId}/dailyStats/${today}`
      //   ),
      //   {
      //     returns: increment(1),
      //   }
      // );
      this.toastr.success('Book returned successfully.', '');
    } catch (error) {
      console.error('Error returning book:', error);
      this.toastr.warning('Something went wrong! Please try again.', '');
    }
  }

  // async getMembers() {
  //   const firestore = getFirestore();
  //   const memberCollectionRef = collection(firestore, 'users');

  //   const queryRef = query(memberCollectionRef,
  //     where('phone', '==', this.phoneNumber)
  //   );

  //   // const queryRef = query(collection(this.db.firestore, 'users'),
  //   //   where('phone', '==', this.phoneNumber)
  //   // );
  //   // const userQuerySnapshot = await getDocs(queryRef);

  //   try {
  //     const memberQuerySnapshot = await getDocs(memberCollectionRef);
  //     this.memberModelList = [];

  //     for (const memberDoc of memberQuerySnapshot.docs) {
  //       const memberData = memberDoc.data() as MemberModel;
  //       memberData.subcollectionData = [];

  //       // Fetch data from the subcollection
  //       const subCollectionQuerySnapshot = await getDocs(
  //         collection(memberDoc.ref, 'issuedBooks')
  //       );

  //       subCollectionQuerySnapshot.forEach((subDoc) => {
  //         const subDocData = subDoc.data();
  //         memberData.subcollectionData.push(subDocData);
  //       });

  //       this.memberModelList.push(memberData);

  //       if (memberData.phone === this.phoneNumber) {
  //         this.userData = memberData;
  //         // console.log("getting user");

  //         console.log(this.userData);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching members data:', error);
  //   }
  // }

  exportToCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Data exported to ${filename}`);
    this.toastr.success('Member Downloaded');
  }

  exportMemberToCSV(): void {
    if (this.userData) { // Check if userData is not null
      const name = this.userData.name || 'unknown';
      const filename = `user_${name}.csv`;
      // const filename = 'user.csv';
      const csvContent = CsvFormat.formatPredictions([this.userData]); // Wrap userData in an array
      this.exportToCSV(csvContent, filename);
    } else {
      console.warn('No user data available to export.');
    }
  }

}



