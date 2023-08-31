import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TagsModel } from 'src/app/utils/TagsModel';
import { collection, doc, setDoc, Firestore, deleteDoc, query, onSnapshot } from "@angular/fire/firestore";
import { DbService } from 'src/app/services/db.service';
import { ToastrService } from 'ngx-toastr';
import { TAGS_COLLECTION } from 'src/app/utils/constants';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
		.modal-backdrop {
    z-index: auto!important;
}
		`,
  ],
})
export class MembersComponent implements OnInit {

  closeResult: string;
  tagsList: TagsModel[];
  loader: boolean = false;
  tagsModal: TagsModel

  tagsForm: FormGroup;

  constructor(
    private firestore: Firestore,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private db: DbService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.getTagsList();
  }

  addNewTagModal(modalRef: any, obj: TagsModel = null) {
    this.modalService.open(modalRef, { size: "md", centered: false });
    this.initializeForm(obj);
  }

  openConfirmationModal(content) {
    this.modalService.open(content, { size: "sm", centered: false });
  }

  getTagsList() {
    const queryRef = query(
      collection(this.firestore, TAGS_COLLECTION)
    );

    onSnapshot(queryRef, ((response) => {
      this.tagsList = response.docs.map((tag) => tag.data() as TagsModel);
    }));
  }

  initializeForm(obj: TagsModel = null) {
    if (obj === null) {
      this.tagsForm = this.fb.group({
        tagID: [doc(collection(this.db.firestore, TAGS_COLLECTION)).id],
        name: [null]
      });
    } else {
      this.tagsForm = this.fb.group({
        tagID: [obj.tagID],
        name: [obj.name]
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
