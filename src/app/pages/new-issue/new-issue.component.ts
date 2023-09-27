import { Component, OnInit } from '@angular/core';
import { DocumentData, Timestamp, collection, collectionGroup, doc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, where } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from 'src/app/utils/BookModel';
import { IssueModel } from 'src/app/utils/IssueModel';
import { MemberModel } from 'src/app/utils/MemberModel';
import { Catalogue } from 'src/app/utils/catalogueModel';
import { MEMBERS_COLLECTION, USERS_COLLECTION } from 'src/app/utils/constants';
// import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.scss']
})
export class NewIssueComponent implements OnInit {

  booksSub: Subscription;
  booksList: BookModel[] = [];
  catalogueSub: Subscription;
  catalogueList: Catalogue[] = [];
  loader: boolean = false;
  issueBookForm: FormGroup;
  filteredData: BookModel[] = [];
  searchText: string = '';
  memberModelList: MemberModel[] = [];
  selectedStartMonth: string = '2023-09';

  constructor(
    private db: DbService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router,
    // private firestore: AngularFirestore,
  ) { }
  ngOnInit(): void {

    this.getMembers();

    // this.db.getBooksList();
    // this.booksSub = this.db.booksSub.subscribe((list) => {
    //   if (list.length !== 0) {
    //     this.booksList = [...list];
    //   }
    // })

    // this.db.getCatalogue();
    // this.catalogueSub = this.db.catalogueSub.subscribe((list) => {
    //   if (list.length !== 0) {
    //     this.catalogueList = [...list];
    //   }
    // })

  }

  navigateToIssueList() {
    this.router.navigate(['/issueList']);
  }

  async getMembers() {
    const firestore = getFirestore();
    const fromDate = new Date()
    const toDate = new Date()

    fromDate.setHours(0, 0, 0)
    toDate.setHours(23, 59, 59)

    const collectionGroupRef = collectionGroup(firestore, 'issuedBooks');
    const queryRef = query(
      collectionGroupRef,
      where('issueDate', '>=', fromDate),
      where('issueDate', '<=', toDate),
      orderBy('issueDate', 'desc')
    );

    onSnapshot(queryRef, (response) => {
      this.memberModelList = response.docs.map((doc) => doc.data() as MemberModel);
      console.log(this.memberModelList);


    })

  }

  async getMembersByMonth(month: number) {
    const firestore = getFirestore();
    const fromDate = new Date(new Date().getFullYear(), month - 1, 1);
    const toDate = new Date(new Date().getFullYear(), month, 0);

    // fromDate.setHours(0, 0, 0)
    // toDate.setHours(23, 59, 59)

    const collectionGroupRef = collectionGroup(firestore, 'issuedBooks');
    const queryRef = query(
      collectionGroupRef,
      where('issueDate', '>=', fromDate),
      where('issueDate', '<=', toDate),
      orderBy('issueDate', 'desc')
    );
    const usersQuerySnapshot = await getDocs(queryRef);

    this.memberModelList = [];

    for (const userDoc of usersQuerySnapshot.docs) {
      const userData = userDoc.data() as MemberModel;
      this.memberModelList.push(userData);
      console.log(userData);
    }

    // onSnapshot(queryRef, (response) => {
    //   this.memberModelList = response.docs.map((doc) => doc.data() as MemberModel);
    //   console.log(this.memberModelList);


    // })

  }

  onStartMonthSelectionChange() {
    const selectedMonthValue = parseInt(this.selectedStartMonth.split('-')[1]);
    this.getMembersByMonth(selectedMonthValue);
    // this.exportUsersToCSV();
  }

  // async fetchUsersByMonth(month: number) {
  //   const firestore = getFirestore();

  //   try {
  //     const usersCollectionRef = collection(firestore, 'users');

  //     const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
  //     const endOfMonth = new Date(new Date().getFullYear(), month, 0);

  //     const queryRef = query(usersCollectionRef, where('createdOn', '>=', startOfMonth), where('createdOn', '<=', endOfMonth));
  //     const usersQuerySnapshot = await getDocs(queryRef);

  //     this.memberModelList = [];

  //     for (const userDoc of usersQuerySnapshot.docs) {
  //       const userData = userDoc.data() as MemberModel;
  //       this.memberModelList.push(userData);
  //     }
  //     console.log('Users added in month', month, ':', this.userModelList);
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //   }
  // }

  // try {
  //   const memberCollectionRef = collection(firestore, 'users');
  //   const memberQuerySnapshot = await getDocs(memberCollectionRef);

  //   this.memberModelList = [];

  //   for (const memberDoc of memberQuerySnapshot.docs) {
  //     const memberData = memberDoc.data() as MemberModel;
  //     this.memberModelList.push(memberData);

  //     const subCollectionQuery = query(collection(memberDoc.ref, 'issuedBooks'));
  //     const subCollectionQuerySnapshot = await getDocs(subCollectionQuery);

  //     const subcollectionData: DocumentData[] = [];
  //     for (const subDoc of subCollectionQuerySnapshot.docs) {
  //       const subDocData = subDoc.data();
  //       subcollectionData.push(subDocData);
  //     }
  //     // console.log(subcollectionData)
  //     memberData.subcollectionData = subcollectionData;
  //   }
  //   // console.log('Admin Data:', this.memberModelList);
  // } catch (error) {
  //   console.error('Error fetching members data:', error);
  // }



}
