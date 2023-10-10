import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TagsModel } from 'src/app/utils/TagsModel';
import { collection, doc, setDoc, Firestore, deleteDoc, query, onSnapshot, getDocs, getFirestore, Timestamp, where } from "@angular/fire/firestore";
import { DbService } from 'src/app/services/db.service';
import { ToastrService } from 'ngx-toastr';
import { MEMBERS_COLLECTION, TAGS_COLLECTION } from 'src/app/utils/constants';
import { User } from 'src/app/utils/user.modal';
import { MemberModel } from 'src/app/utils/MemberModel';
import { SubscriptionModel } from 'src/app/utils/subscriptionModel';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {

  // closeResult: string;
  // tagsList: TagsModel[];
  // loader: boolean = false;
  // tagsModal: TagsModel

  members: MemberModel[] = [];
  memberModel: MemberModel;
  memberModelList: MemberModel[] = [];
  memberForm: FormGroup;
  subscriptionList: SubscriptionModel[] = [];
  subscriptionSub: Subscription;
  subscription: SubscriptionModel[] = [];
  loader: boolean;

  // searchForm = new FormGroup({
  //   param: new FormControl(''),
  // });

  numberParam: string = '';

  // tagsForm: FormGroup;

  constructor(
    private firestore: Firestore,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private db: DbService,
    private toast: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    // private toast
  ) {
    // this.searchForm = this.fb.group({
    //   param: [''],
    // }); 
  }

  ngOnInit(): void {
    // this.getTagsList();
    this.getMembers();

    // this.activatedRoute.queryParams.subscribe(params => {
    //   const phoneNumber = params['phone'];
    //   if (phoneNumber) {
    //     this.numberParam = phoneNumber;
    //   }
    // }
    // );
    // this.activatedRoute.queryParams.subscribe(async (params) => {
    //   const phoneNumber = params['phone'];

    //   if (phoneNumber) {
    //     this.numberParam = phoneNumber;

    //     // Check if a user with the provided phone number exists
    //     const userExists = await this.checkUserExists(phoneNumber);

    //     if (userExists) {
    //       // If the user exists, navigate to the desired route
    //       this.router.navigate(['/userHistory'], {
    //         queryParams: { phone: phoneNumber },
    //       });
    //     } else {
    //       // If the user doesn't exist, you can show a message or handle it accordingly
    //       console.log(`User with phone number ${phoneNumber} does not exist.`);
    //     }
    //   }
    // });

    this.db.getPlansList();
    this.subscriptionSub = this.db.subscriptionsSub.subscribe((list) => {
      // console.log(list);

      if (list !== null) {
        this.subscriptionList = [...list];
        // this.tempTypeList = [...list];
      }
    })
    this.subscription = this.subscriptionList;
  }

  // async checkUserExists(phoneNumber: string): Promise<boolean> {
  //   // Check if a user with the provided phone number exists
  //   const firestore = getFirestore();
  //   const memberCollectionRef = collection(firestore, 'users');
  //   const queryRef = query(memberCollectionRef, where('phone', '==', phoneNumber));
  //   const querySnapshot = await getDocs(queryRef);
  //   return !querySnapshot.empty;
  // }

  initializeForm(obj: MemberModel | null) {
    if (obj === null) {
      this.memberForm = this.fb.group({
        authId: [doc(collection(this.db.firestore, MEMBERS_COLLECTION)).id],
        name: [null],
        email: [null],
        age: [null],
        phone: [null],
        address: [null],
        subscription: [null, Validators.required],
        createdOn: [Timestamp.now()],
        // subscription: [null, Validators.required],
      });
      // this.subscriptionList = [...this.]

    } else {
      this.memberForm = this.fb.group({
        authId: [obj.authId],
        name: [obj.name],
        email: [obj.email],
        age: [obj.age],
        phone: [obj.phone],
        subcription: [obj.subscription.length > 0 ? obj.subscription[0] : null, Validators.required],
        createdOn: [obj.createdOn],
      });
      // this.tempTypeList = this.SubscriptionList.filter(
      //   type => !obj.subscription.some(selectedType => selectedType.subscriptionID === type.subscriptionID)
      // );
    }
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
      }
      // console.log('Admin Data:', this.memberModelList);
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  }

  addNewMember(modalRef: any, obj: MemberModel = null) {
    this.modalService.open(modalRef, { size: "md", centered: false });
    this.initializeForm(obj);
  }

  onPhoneNumberChange(content) {
    // Get the current value of the input field
    const phone = this.numberParam;

    // Check if the input value has 10 digits
    if (phone.length === 10) {
      // Find a user with the provided phone number
      const matchingUser = this.memberModelList.find(user => user.phone === phone);

      if (matchingUser) {
        // If a user with the phone number exists, navigate to the desired route
        this.router.navigate(['/userHistory'], {
          queryParams: { phone: phone },
        });
      } else {
        // If no user matches the phone number, you can handle it as needed
        this.toast.error(`Member with phone number ${phone} does not exist.`, "Add new Member")
        console.log(`User with phone number ${phone} does not exist.`);
        // For example, you can display an error message or take another action.
        this.modalService.open(content, { size: "md", centered: false });
        this.initializeForm(null);
      }
    }
  }

  onRowClick(member: MemberModel) {
    const phone = member.phone; // Get the phone number from the clicked row's data

    if (phone) {
      // If a phone number exists in the row data, navigate to the desired route
      this.router.navigate(['/userHistory'], {
        queryParams: { phone: phone },
      });
    } else {
    }
  }



  async saveToFirestore() {
    this.loader = true;
    let values: MemberModel = { ...this.memberForm.value };
    let docRef = doc(collection(this.db.firestore, 'users'), values.authId);
    setDoc(docRef, { ...values }, { merge: true })
      .then(() => {
        this.loader = true;
        // console.log(values);
        this.modalService.dismissAll();
        this.toast.success("Member Added Successfully", "")
      }, (error) => {
        console.log(error);
        this.loader = false;
        this.toast.warning("Something went wrong! Please try again.", "");
      });

  }

  // addNewTagModal(modalRef: any, obj: TagsModel = null) {
  //   this.modalService.open(modalRef, { size: "md", centered: false });
  //   this.initializeForm(obj);
  // }

  // openConfirmationModal(content) {
  //   this.modalService.open(content, { size: "sm", centered: false });
  // }

  // getTagsList() {
  //   const queryRef = query(
  //     collection(this.firestore, TAGS_COLLECTION)
  //   );

  //   onSnapshot(queryRef, ((response) => {
  //     this.tagsList = response.docs.map((tag) => tag.data() as TagsModel);
  //   }));
  // }

  // initializeForm(obj: TagsModel = null) {
  //   if (obj === null) {
  //     this.tagsForm = this.fb.group({
  //       tagID: [doc(collection(this.db.firestore, TAGS_COLLECTION)).id],
  //       name: [null]
  //     });
  //   } else {
  //     this.tagsForm = this.fb.group({
  //       tagID: [obj.tagID],
  //       name: [obj.name]
  //     });
  //   }
  // }

  // openDeleteModal(modal, tagsModal: TagsModel) {
  //   this.modalService.open(modal, { size: "sm" });
  //   this.tagsModal = tagsModal;
  // }

  // async saveToFirestore() {
  //   this.loader = true;
  //   let values: TagsModel = { ...this.tagsForm.value };
  //   let docRef = doc(collection(this.db.firestore, TAGS_COLLECTION), values.tagID);
  //   setDoc(docRef, { ...values }, { merge: true })
  //     .then(() => {
  //       this.loader = false;
  //       this.modalService.dismissAll();
  //       this.toast.success("Tag Added Successfully", "")
  //     }, (error) => {
  //       console.log(error);
  //       this.loader = false;
  //       this.toast.warning("Something went wrong! Please try again.", "");
  //     });
  // }
}
