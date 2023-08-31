import { TagsModel } from 'src/app/utils/TagsModel';
import { BOOKS_COLLECTION } from './../../utils/constants';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from './../../utils/BookModel';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { NgbModal, NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, OperatorFunction, Subject, Subscription, Observable, filter, merge, map } from 'rxjs';
import { setDoc, collection, doc, Timestamp, deleteDoc, Firestore, onSnapshot, query, orderBy, startAt, endAt, where } from '@angular/fire/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from '@angular/fire/storage';
import { Catalogue } from 'src/app/utils/catalogueModel';
import { privateDecrypt } from 'crypto';



@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {
  tagControl = new FormControl();
  typeControl = new FormControl();

  // Already Entered
  inputTags: TagsModel[] = [];
  inputType: Catalogue[] = [];

  // From DB Service - All Tags
  tagsList: TagsModel[] = [];
  tempTagList: TagsModel[] = [];

  catalogueList: Catalogue[] = [];
  tempTypeList: Catalogue[] = [];

  // Exclusive Input Tags
  tags: TagsModel[] = []
  type: Catalogue[] = [];

  bookForm: FormGroup;
  loader: boolean = false;

  bookModal: BookModel;
  booksList: BookModel[] = [];
  booksSub: Subscription;
  tagsSub: Subscription;
  catalogueSub: Subscription;
  b: boolean;

  tempFile: any = null;
  canWrite: boolean;

  searchText: string = '';
  filteredData: BookModel[] = [];

  constructor(
    private db: DbService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private modalService: NgbModal,
    private fireStore: Firestore
  ) {

  }

  ngOnInit(): void {
    // this.canWrite = this.db.canWriteCheck() || false;
    this.db.getBooks();
    this.booksSub = this.db.booksSub.subscribe((list) => {
      if (list.length !== 0) {
        this.booksList = [...list];
      }
    })

    this.db.getTagsList();
    this.tagsSub = this.db.tagsSub.subscribe((list) => {
      if (list.length !== 0) {
        this.tagsList = [...list];
        this.tempTagList = [...list];
      }
    })
    this.tags = this.tagsList

    this.db.getCatalogueList();
    this.catalogueSub = this.db.catalogueSub.subscribe((list) => {
      // console.log(list);

      if (list !== null) {
        this.catalogueList = [...list];
        this.tempTypeList = [...list];
      }
    })
    this.type = this.catalogueList
  }

  removeFromCatalogue(idx: number) {
    let catalogue = this.inputType.splice(idx, 1)[0];
    this.catalogueList = this.tempTypeList.filter(x => !this.inputType.some(e => e.catalogueId === x.catalogueId))
    // var index = this.inputTags.indexOf(tag);
    // if (index !== -1) {
    //   this.inputTags.splice(index, 1);
    //   this.tags.push(tag)
    // }
  }

  removeFromTags(idx: number) {
    let tagModel = this.inputTags.splice(idx, 1)[0];
    this.tagsList = this.tempTagList.filter(x => !this.inputTags.some(e => e.tagID === x.tagID))
    // var index = this.inputTags.indexOf(tag);
    // if (index !== -1) {
    //   this.inputTags.splice(index, 1);
    //   this.tags.push(tag)
    // }
  }

  public addTag(e): void {
    let tagValue: string = String(e.target.value);
    if (tagValue.length === 0) return;

    let tagModel: TagsModel = this.tagsList.find(x => x.name === tagValue);
    if (this.inputTags.some(x => x.tagID === tagModel.tagID)) return;
    this.inputTags.push({ ...tagModel });
    this.tagsList = this.tempTagList.filter(x => !this.inputTags.some(e => e.tagID === x.tagID))
    this.tagControl.reset();
  }

  public addType(e): void {
    let catalogueValue: string = String(e.target.value);
    if (catalogueValue.length === 0) return;

    let catalogueModel: Catalogue = this.catalogueList.find(x => x.name === catalogueValue);
    if (this.inputType.some(x => x.catalogueId === catalogueModel.catalogueId)) return;
    this.inputType.push({ ...catalogueModel });
    this.typeControl.setValue(catalogueModel.name);
    // this.catalogueList = this.tempTypeList.filter(x => !this.inputType.some(e => e.catalogueId === x.catalogueId))
  }


  initializeForm(obj: BookModel = null) {
    this.tempFile = null
    this.inputTags = [];
    // this.inputType = [];
    if (obj === null) {
      this.bookForm = this.fb.group({
        docId: [doc(collection(this.db.firestore, BOOKS_COLLECTION)).id],
        fileType: [0],
        url: [null],
        title: [null],
        author: [null],
        // tags: [null],
        isbn: [null],
        available: [null],
        issued: [0],
        price: [null],
        type: [null, Validators.required]
      });
      this.tagsList = [...this.tempTagList]
      // this.catalogueList = [...this.tempTypeList]
      this.tempTypeList = [...this.catalogueList];
    } else {
      this.bookForm = this.fb.group({
        docId: [obj.docId],
        fileType: [obj.fileType],
        url: [obj.url],
        title: [obj.title],
        author: [obj.author],
        // tags: [obj.tags],
        isbn: [obj.isbn],
        available: [obj.available],
        issued: [obj.issued],
        price: [obj.price],
        type: [obj.catalogue.length > 0 ? obj.catalogue[0] : null, Validators.required]
      });
      this.inputTags = [...obj?.tags];
      console.log(this.inputTags)
      // this.inputType = [...obj?.catalogue];
      // console.log(this.inputType)
      this.tagsList = this.tempTagList.filter(x => !this.inputTags.some(e => e.tagID === x.tagID))
      // this.catalogueList = this.tempTypeList.filter(x => !this.inputType.some(e => e.catalogueId === x.catalogueId))
      this.tempTypeList = this.catalogueList.filter(
        type => !obj.catalogue.some(selectedType => selectedType.catalogueId === type.catalogueId)
      );

    }
  }

  checkImageType(files) {
    this.tempFile = files[0];
    if (
      this.tempFile.type === "image/png" ||
      this.tempFile.type === "image/jpeg" ||
      this.tempFile.type === "image/jpg") {

    } else {
      this.tempFile = null;
      this.toast.warning('Invalid image format. Only .png/.jpg/.jpeg file supported.', 'Alert');
    }
  }

  openBooksModal(modalRef: any, obj: BookModel = null) {
    this.modalService.open(modalRef, { size: 'lg' });
    this.initializeForm(obj);

    // console.log(this.booksList)
  }


  async saveToFirestore() {
    this.loader = true;
    let values: BookModel = { ...this.bookForm.value };
    values.tags = this.inputTags.length === 0 ? [] : [...this.inputTags];

    if (this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = "media/" + values.fileType + "/" + new Date().getTime() + "_" + this.tempFile.name;;
      const FileRef = ref(this.db.storage, FilePath);
      await uploadBytes(FileRef, this.tempFile);
      values.url = await getDownloadURL(FileRef);
    }

    let docRef = doc(collection(this.db.firestore, BOOKS_COLLECTION), values.docId);
    setDoc(docRef, { ...values }, { merge: true })
      .then(() => {
        this.inputTags = []
        this.inputType = []
        this.loader = false;
        this.modalService.dismissAll();
        // delete this.tempFile;
        this.toast.success("Book Saved Successfully", "")
      }, (error) => {
        console.log(error);
        this.loader = false;
        this.toast.warning("Something went wrong! Please try again.", "");
      });
  }

  openDeleteModal(modal, imageModal: BookModel) {
    this.modalService.open(modal, { size: "sm" });
    this.bookModal = imageModal;
  }

  // async deleteBook() {
  //   this.loader = true;
  //   if (this.bookModal.url != "") {
  //     let storageRef = ref(this.db.storage, this.bookModal.url);
  //     await deleteObject(storageRef);
  //   }

  //   let docRef = doc(collection(this.db.firestore, BOOKS_COLLECTION), this.bookModal.docId);
  //   deleteDoc(docRef)
  //     .then(() => {
  //       let idx = this.booksList.findIndex(x => x.docId === this.bookModal.docId);
  //       this.booksList.slice(idx, 1);

  //       this.modalService.dismissAll();
  //       this.toast.show("Book Deleted Successfully !");
  //       this.loader = false
  //     }, (error) => {
  //       // console.log(error);
  //       this.loader = false
  //       this.toast.warning("Something went wrong! Please try again.");
  //     }
  //     );
  // }

  async deleteBook() {
    this.loader = true;

    // if (this.bookModal.docId) {
    //   try {
    //     const storageRef = ref(this.db.storage, this.bookModal.docId);
    //     await deleteObject(storageRef);
    //   } catch (error) {
    //     console.error("Error deleting object from storage:", error);
    //   }
    // }

    const docRef = doc(collection(this.db.firestore, BOOKS_COLLECTION), this.bookModal.docId);

    try {
      await deleteDoc(docRef);
      const idx = this.booksList.findIndex(x => x.docId === this.bookModal.docId);
      this.toast.show("Book Deleted Successfully !");
      this.modalService.dismissAll();

      if (idx !== -1) {
        this.booksList.splice(idx, 1);

      }
    } catch (error) {
      console.error("Error deleting document from Firestore:", error);
      this.toast.warning("Something went wrong! Please try again.");
    } finally {
      this.loader = false;
    }
  }

  openImage(url: string) {
    window.open(url, "_blank");
  }

  ngOnDestroy(): void {
    if (this.booksSub !== undefined) this.booksSub.unsubscribe();
  }

  // getBooksListWhere(condition: string, param: any) {
  //   let collectionRef = collection(this.fireStore, BOOKS_COLLECTION);
  //   let queryRef: any;

  //   if (condition === "nameLowercase") {
  //     queryRef = query(
  //       collectionRef,
  //       orderBy(condition),
  //       startAt(param),
  //       endAt(param + '\uf8ff')
  //     );
  //   } else {
  //     queryRef = query(
  //       collectionRef,
  //       where(condition, "==", param),
  //       orderBy("name")
  //     );
  //   }

  //   onSnapshot(queryRef, (value) => {
  //     const books = value.docs.map(e => e.data() as BookModel);
  //     this.booksSub.next(books); // Emit values to the subject
  //     this.b = true;
  //   }, (error) => {
  //     console.log(error);
  //   });
  // }

  filterData(): void {
    this.filteredData = this.booksList
      .filter(book => book.title.toLowerCase().includes(this.searchText.toLowerCase()));
    console.log(this.filteredData);

    console.log("not working");
  }

  onSearchChange(): void {
    this.filterData();
  }




}
