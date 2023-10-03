import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData, collection, getDocs, getFirestore, query, where } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';
import { IssueModel } from 'src/app/utils/IssueModel';
import { MemberModel } from 'src/app/utils/MemberModel';
import { SubscriptionModel } from 'src/app/utils/subscriptionModel';

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

        // subscription.issuePeriod || '',
        //subscription.validity || '',
      ];

      // Push the main member data as a row
      csvRows.push(mainRow.join(','));

      if (subcollectionData && subcollectionData.length > 0) {
        subcollectionData.forEach((subData) => {
          // Create a row for each item in subcollectionData
          const issueBooks = subData.title || ''; // Replace 'title' with the correct property name
          const issueDate = subData.issueDate.toDate();
          const returnDate = subData.returnDate.toDate();
          const subRow = [
            '', // Leave empty for the main fields
            '',
            '',
            '',
            '',
            '',
            issueBooks || '',
            issueDate ? issueDate.getDate() + " " + issueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', weekday: 'long' }) : '',
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


  constructor(

    private modalService: NgbModal,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private db: DbService,
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

  onPhoneNumberInput() {

    const phoneNumber = this.phoneNumber;

    if (phoneNumber && phoneNumber.length === 10) {
      this.submitButton.nativeElement.click();
      // this.renderer.selectRootElement('#submitButton').click();
    }
  }

  async getMembers() {
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
          collection(memberDoc.ref, 'issuedBooks')
        );

        memberData.subcollectionData = subCollectionQuerySnapshot.docs.map(subDoc => subDoc.data());

        this.memberModelList = [memberData];

        this.userData = memberData;
        console.log('User data:', this.userData);
      } else {
        console.log('No user found with phone number:', this.phoneNumber);
        this.memberModelList = [];
        this.userData = null;
      }
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  }

  navigateToOtherUser() {
    // $event.preventDefault();
    this.router.navigate(['/userHistory']);
    // this.router.navigate(['/dummy-route'], { skipLocationChange: true }).then(() => {

    //   // Navigate back to the 'other-user' route
    //   // this.router.navigate(['/other-user'], { skipLocationChange: true });
    // });
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



