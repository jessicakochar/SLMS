import { Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, NgZone } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  collection,
  doc,
  Firestore,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
} from "@angular/fire/firestore";
import { TagsModel } from "../../utils/TagsModel";
import { TAGS_COLLECTION } from "../../utils/constants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DbService } from "src/app/services/db.service";
import { setDoc } from "@angular/fire/firestore";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-tags",
  templateUrl: "./tags.component.html",
  styleUrls: ["./tags.component.scss"],

})
export class TagsComponent implements OnInit {
  closeResult: string;
  tagsList: TagsModel[] = [];
  loader: boolean = false;
  tagsSub: Subscription;
  tagsModal: TagsModel
  loading: boolean = false;

  tagsForm: FormGroup;

  constructor(
    private firestore: Firestore,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private db: DbService,
    private toast: ToastrService,
    private change: ChangeDetectorRef,
    private zone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.db.getTagsList();
    this.tagsSub = this.db.tagsSub.subscribe((list) => {
      if (list.length !== 0) {
        this.tagsList = [...list];
        this.loading = false;
      }
    })
  }

  addNewTagModal(modalRef: any, obj: TagsModel = null) {
    this.modalService.open(modalRef, { size: "md", centered: false });
    this.initializeForm(obj);
  }

  openConfirmationModal(content) {
    this.modalService.open(content, { size: "sm", centered: false });
  }

  initializeForm(obj: TagsModel = null) {
    if (obj === null) {
      this.tagsForm = this.fb.group({
        tagID: [doc(collection(this.db.firestore, TAGS_COLLECTION)).id],
        name: [null],
        description: [null],
        active: [true],
        createdOn: [Timestamp.now()],
      });
    } else {
      this.tagsForm = this.fb.group({
        tagID: [obj.tagID],
        name: [obj.name],
        description: [obj.description],
        active: [obj.active],
        createdOn: [obj.createdOn],
      });
    }
  }

  openDeleteModal(modal, tagsModal: TagsModel) {
    this.modalService.open(modal, { size: "sm" });
    this.tagsModal = tagsModal;
  }

  async deleteTag() {
    this.loader = true;
    let docRef = doc(collection(this.db.firestore, TAGS_COLLECTION), this.tagsModal.tagID);
    deleteDoc(docRef)
      .then(() => {
        let idx = this.tagsList.findIndex(x => x.tagID === this.tagsModal.tagID);
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
    let values: TagsModel = { ...this.tagsForm.value };
    let docRef = doc(collection(this.db.firestore, TAGS_COLLECTION), values.tagID);
    setDoc(docRef, { ...values }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Tag Added Successfully", "")
      }, (error) => {
        console.log(error);
        this.loader = false;
        this.toast.warning("Something went wrong! Please try again.", "");
      });
  }

}
