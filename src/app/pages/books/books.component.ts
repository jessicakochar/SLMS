import { TagsModel } from 'src/app/utils/TagsModel';
import { BOOKS_COLLECTION } from './../../utils/constants';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';
import { BookModel } from './../../utils/BookModel';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { NgbModal, NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, OperatorFunction, Subject, Subscription, Observable, filter, merge, map } from 'rxjs';
import { setDoc, collection, doc, Timestamp, deleteDoc, Firestore, onSnapshot, query as firestoreQuery, orderBy, startAt, endAt, where, query, getDocs } from '@angular/fire/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from '@angular/fire/storage';
import { Catalogue } from 'src/app/utils/catalogueModel';
import { privateDecrypt } from 'crypto';
import { log } from 'console';
// import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss'],
  //   providers: [
  //     NgbTabset
  // ]
})
export class BooksComponent implements OnInit {
  tagControl = new FormControl();
  typeControl = new FormControl();

  inputTags: TagsModel[] = [];
  inputType: Catalogue[] = [];

  tagsList: TagsModel[] = [];
  tempTagList: TagsModel[] = [];
  selectedTags: string[] = [];

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
  tempBookList: BookModel[] = [];

  tagsSub: Subscription;
  catalogueSub: Subscription;
  b: boolean;

  tempFile: any = null;
  canWrite: boolean;

  searchTitle: string = '';
  searchIsbn: string = '';
  nameSearchText: string = "";
  nameSearchForm: FormGroup;
  isbnSearchForm: FormGroup;
  isbnSearchText: string = "";
  searchSignal: number = -1;
  alphaSearchText: string = "";
  viewAllMode: boolean = false;
  filteredData: BookModel[] = [];
  branchId: string = "";
  selectedAlphabet: string = '';
  selectedTitle: string = '';
  selectedISBN: string = '';
  bookTitleArray: string[];

  characters: string[] = Array(26).fill(97).map((ele, idx) => String.fromCharCode(ele + idx));

  searchForm = new FormGroup({
    param: new FormControl(''),
  });


  constructor(
    private db: DbService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private modalService: NgbModal,
    private fireStore: Firestore
  ) {

  }

  ngOnInit(): void {

    this.db.getBooks();
    this.booksSub = this.db.booksSub.subscribe((list) => {
      if (list.length !== 0) {
        this.booksList = [...list];
      }
      this.tempBookList = [...this.booksList];
      this.filteredData = [...this.booksList];
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
  }

  removeFromTags(idx: number) {
    let tagModel = this.inputTags.splice(idx, 1)[0];
    this.tagsList = this.tempTagList.filter(x => !this.inputTags.some(e => e.tagID === x.tagID))
  }

  // public addTag(e): void {
  //   let tagValue: string = String(e.target.value);
  //   if (tagValue.length === 0) return;

  //   let tagModel: TagsModel = this.tagsList.find(x => x.name === tagValue);
  //   if (this.inputTags.some(x => x.tagID === tagModel.tagID)) return;
  //   this.inputTags.push({ ...tagModel });
  //   this.tagsList = this.tempTagList.filter(x => !this.inputTags.some(e => e.tagID === x.tagID))
  //   this.tagControl.reset();
  // }

  public addTag(tag: TagsModel): void {
    if (!tag) return;

    if (this.inputTags.some(x => x.tagID === tag.tagID)) return;

    this.inputTags.push({ ...tag });
    this.tagsList = this.tagsList.filter(x => x.tagID !== tag.tagID);
    this.tagControl.reset();
  }

  public isTagSelected(tag: TagsModel): boolean {
    return this.inputTags.some(x => x.tagID === tag.tagID);
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
    console.log(obj);
    debugger;

    this.tempFile = null
    this.inputTags = [];
    // this.inputType = [];
    if (obj === null) {
      console.log(1);

      this.bookForm = this.fb.group({
        bookId: [doc(collection(this.db.firestore, BOOKS_COLLECTION)).id],
        fileType: [0],
        createdOn: [Timestamp.now()],
        url: [null],
        title: [null],
        author: [null],
        // tags: [null],
        isbn: [null],
        total: [null],
        issued: [0],
        price: [null],
        type: [null]
      });
      this.tagsList = [...this.tempTagList]
      // this.catalogueList = [...this.tempTypeList]
      this.tempTypeList = [...this.catalogueList];
    } else {
      console.log(2);

      this.bookForm = this.fb.group({
        bookId: [obj.bookId],
        fileType: [obj.fileType],
        createdOn: [obj.createdOn],
        url: [obj.url],
        title: [obj.title],
        author: [obj.author],
        bookTitleArray: [[]],
        // tags: [obj.tags],
        isbn: [obj.isbn],
        total: [obj.total],
        issued: [obj.issued],
        price: [obj.price],
        type: [obj.catalogue ?? null]
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

    const bookTitle = values.title.toLowerCase();
    const bookTitleArray = [];
    for (let i = 1; i <= bookTitle.length; i++) {
      bookTitleArray.push(bookTitle.substring(0, i));
    }

    values.bookTitleArray = bookTitleArray;

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

  // filterData(): void {
  //   this.filteredData = this.booksList.filter(book =>
  //     book.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
  //     // book.tags.some(tag => tag.name.toLowerCase().includes(this.searchText.toLowerCase())) ||
  //     // book.author.toLowerCase().includes(this.searchText.toLowerCase()) ||
  //     book.isbn.toLowerCase().includes(this.searchText.toLowerCase())
  //   );
  //   console.log(this.filteredData);
  // }
  // onSearchChange(): void {
  //   this.filterData();
  // }

  filterBooksByAlphabet(alphabet: string) {
    this.selectedAlphabet = alphabet;
    this.db.booksRetrievedBool = false
    this.db.getBooks(alphabet);
  }

  filterBooksByTitle() {
    this.selectedTitle = this.searchForm.controls.param.value;
    this.db.booksRetrievedBool = false
    this.db.getBooksByTitle(this.searchForm.controls.param.value);
    this.filterBooksByISBN()
  }

  filterBooksByISBN() {
    this.selectedISBN = this.searchForm.controls.param.value;
    this.db.booksRetrievedBool = false
    this.db.getBooksByISBN(this.searchForm.controls.param.value);
  }


}
