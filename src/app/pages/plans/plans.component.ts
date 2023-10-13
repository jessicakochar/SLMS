import { Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, NgZone } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { collection, doc, Firestore, deleteDoc, query, onSnapshot } from "@angular/fire/firestore";
import { SubscriptionModel } from "../../utils/subscriptionModel";
import { PLANS_COLLECTION } from "../../utils/constants";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { DbService } from "src/app/services/db.service";
import { setDoc } from "@angular/fire/firestore";
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {

  closeResult: string;
  plansList: SubscriptionModel[] = [];
  loader: boolean = false;
  subscriptionsSub: Subscription;
  plansModel: SubscriptionModel

  plansForm: FormGroup;

  constructor(
    private firestore: Firestore,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private db: DbService,
    private toast: ToastrService,
    private change: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.db.getPlansList();
    this.subscriptionsSub = this.db.subscriptionsSub.subscribe((list) => {
      if (list.length !== 0) {
        this.plansList = [...list];
      }
    })
    console.log(this.plansList)
  }

  addNewPlanModal(modalRef: any, obj: SubscriptionModel = null) {
    this.modalService.open(modalRef, { size: "md", centered: false });
    this.initializeForm(obj);
  }

  openConfirmationModal(content) {
    this.modalService.open(content, { size: "sm", centered: false });
  }

  initializeForm(obj: SubscriptionModel = null) {
    if (obj === null) {
      this.plansForm = this.fb.group({
        planID: [doc(collection(this.db.firestore, PLANS_COLLECTION)).id],
        name: [null],
        maxBooks: [null],
        issuePeriod: [null],
        price: [null],
        validity: [null],
        descriptionTitle: [null],
        description: [null],
        // description: this.fb.array([this.createDescriptionItem()]),

      });
    } else {
      this.plansForm = this.fb.group({
        planID: [obj.planID],
        name: [obj.name],
        maxBooks: [obj.maxBooks],
        issuePeriod: [obj.issuePeriod],
        price: [obj.price],
        validity: [obj.validity],
        descriptionTitle: [obj.descriptionTitle],
        description: [obj.description],
        // description: this.fb.array(obj.description.map((desc: DescriptionModel) => this.createDescriptionItem(desc))),
      });
    }
  }

  openDeleteModal(modal, tagsModal: SubscriptionModel) {
    this.modalService.open(modal, { size: "sm" });
    this.plansModel = tagsModal;
  }

  async deletePlan() {
    this.loader = true;
    let docRef = doc(collection(this.db.firestore, PLANS_COLLECTION), this.plansModel.planID);
    deleteDoc(docRef)
      .then(() => {
        let idx = this.plansList.findIndex(x => x.planID === this.plansModel.planID);
        this.modalService.dismissAll();
        this.toast.success("Tag Deleted Successfully !");
        this.loader = false
      }, (error) => {
        this.loader = false
        this.toast.warning("Something went wrong ! Please try again.");
      }
      );
  }

  async saveToFirestore() {
    this.loader = true;
    let values: SubscriptionModel = { ...this.plansForm.value };
    let docRef = doc(collection(this.db.firestore, PLANS_COLLECTION), values.planID);
    console.log("form", values);
    setDoc(docRef, { ...values }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Plan Added Successfully", "")
      }, (error) => {
        console.log(error);
        this.loader = false;
        this.toast.warning("Something went wrong! Please try again.", "");
      });
  }

  memberDetails(planName: string) {
    if (planName) {
      this.router.navigate(['/members'], {
        queryParams: {
          planName: planName
        },
      });
    } else {
      // Handle the case when planName is not provided.
    }
  }

  // memberDetails(planID: string) {
  //   if (planID) {
  //     this.router.navigate(['/members'], {
  //       queryParams: {
  //         planID: planID
  //       },
  //     });
  //   } else {
  //     // Handle the case when planName is not provided.
  //   }
  // }


  // addDescriptionItem() {
  //   const descriptionArray = this.plansForm.get('description') as FormArray;
  //   descriptionArray.push(this.createDescriptionItem());
  // }

  // removeDescriptionItem(index: number) {
  //   const descriptionArray = this.plansForm.get('description') as FormArray;
  //   descriptionArray.removeAt(index);
  // }


  // createDescriptionItem(desc: DescriptionModel = null): FormGroup {
  //   if (desc === null) {
  //     desc = new DescriptionModel();
  //   }
  //   return this.fb.group({
  //     title: [desc.title || null],
  //     description: [desc.description || null],
  //     // summary: [desc.summary],
  //   });
  // }


}
