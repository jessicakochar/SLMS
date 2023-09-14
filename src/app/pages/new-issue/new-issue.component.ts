import { Component, OnInit } from '@angular/core';
import { DocumentData, Timestamp, collection, doc, getDocs, getFirestore, query, setDoc } from '@angular/fire/firestore';
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
  // subcollectionData: any[];

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
    this.router.navigate(['/issueList']); // Navigate to the new issue page
  }

  async getMembers() {
    const firestore = getFirestore();

    try {
      const memberCollectionRef = collection(firestore, 'users');
      const memberQuerySnapshot = await getDocs(memberCollectionRef);

      this.memberModelList = [];

      for (const memberDoc of memberQuerySnapshot.docs) {
        const memberData = memberDoc.data() as MemberModel;
        this.memberModelList.push(memberData);

        const subCollectionQuery = query(collection(memberDoc.ref, 'issuedBooks'));
        const subCollectionQuerySnapshot = await getDocs(subCollectionQuery);

        const subcollectionData: DocumentData[] = [];
        for (const subDoc of subCollectionQuerySnapshot.docs) {
          const subDocData = subDoc.data();
          subcollectionData.push(subDocData);
        }
        console.log(subcollectionData)
        memberData.subcollectionData = subcollectionData;
      }
      // console.log('Admin Data:', this.memberModelList);
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  }



}
