import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData, collection, getDocs, getFirestore, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';
import { MemberModel } from 'src/app/utils/MemberModel';

export class CsvFormat {
  static formatPredictions(members: MemberModel[]): string {
    const csvRows = members.map(member => {
      const {
        name,
        email,
        address,
        age,
        phone,
        userId,
        // locationInfo,
        // weatherInfo,
      } = member;

      return (
        `${name},` +
        `${email},` +
        `${address},` +
        `${age},` +
        `${phone},` +
        `${userId},`
      );
    });

    const header = 'User,Email, Address, Age, Phone, UserId';
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
  @ViewChild('userDataModal') userDataModal: any;
  currentDate: Date = new Date();
  // @ViewChild('submitButton') submitButton: any;
  @ViewChild('submitButton', { read: ElementRef }) submitButton: ElementRef;


  constructor(

    private modalService: NgbModal,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private db: DbService,
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
      const filename = 'user.csv';
      const csvContent = CsvFormat.formatPredictions([this.userData]); // Wrap userData in an array
      this.exportToCSV(csvContent, filename);
    } else {
      console.warn('No user data available to export.');
    }
  }

}



