import { SubscriptionModel } from '../utils/subscriptionModel';
import { FirebaseApp } from '@angular/fire/app';
import { NgZone } from '@angular/core';
import { TagsModel } from 'src/app/utils/TagsModel';
import { CATALOGUE_COLLECTION, ROLE_COLLECTION, TAGS_COLLECTION } from 'src/app/utils/constants';
import { BookModel } from './../utils/BookModel';
import { BOOKS_COLLECTION, PLANS_COLLECTION } from './../utils/constants';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Firestore, getFirestore, collection, where, query, onSnapshot, getDocs, orderBy, limit, collectionGroup, QuerySnapshot } from '@angular/fire/firestore';
import { FirebaseStorage, getStorage } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { BehaviorSubject, of, map, Observable, Subscription } from 'rxjs';
import { Catalogue } from '../utils/catalogueModel';
import { RoleModel } from '../utils/RoleModel';
import * as util from 'src/app/utils/constants';
// import { Firestore } from '@angular/fire/firestore';



@Injectable({
  providedIn: 'root'
})
export class DbService {

  storage: FirebaseStorage = getStorage(this.auth.app);

  booksSub: BehaviorSubject<BookModel[]> = new BehaviorSubject<BookModel[]>([]);
  booksRetrievedBool: boolean = false;
  tagsSub: BehaviorSubject<TagsModel[]> = new BehaviorSubject<TagsModel[]>([]);
  subscriptionsSub: BehaviorSubject<SubscriptionModel[]> = new BehaviorSubject<SubscriptionModel[]>([]);

  catalogueSub: BehaviorSubject<Catalogue[]> = new BehaviorSubject<Catalogue[]>([]);
  catalogueRetrievedBool: boolean = false;

  roleModelListSubject = new BehaviorSubject<RoleModel[]>(null);
  roleModelListSub: Subscription;
  roleRetrievedBool: boolean = false;

  extraModelSubject: any;
  userModelSubject: any;

  // db: any;

  constructor(
    public firestore: Firestore,
    private auth: AuthService,
    private db: Firestore,
    private router: Router,
  ) {
    this.getTagsList();
  }

  canWriteCheck(url?) {
    if (JSON.parse(localStorage.getItem("admin")).roles[url || this.router.url.replace("/", "").split("/")[0]] === 2) {
      return true;
    } else {
      return false;
    }
  }

  // async getRoleFromDb() {
  //   if (!this.roleModelListRetrieved) {
  //     this.roleModelListSub = this.db
  //       .collection(util.ROLE_COLLECTION).doc(util.ROLE_COLLECTION)
  //       .valueChanges().subscribe((data) => {
  //         this.roleModelListRetrieved = true;
  //         let list: RoleModel[] = data['roleList'];
  //         if (list) {
  //           this.roleModelListSubject.next(list);
  //         }
  //       });
  //   }
  // }

  async getAllRolesFromDb() {
    if (!this.roleRetrievedBool) {
      const collectionRef = collection(this.firestore, util.ROLE_COLLECTION);
      const queryRef = query(collectionRef);
      onSnapshot(queryRef, (querySnapshot) => {
        const roleModelList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.roleList) {
            roleModelList.push(...data.roleList);
          }
        });

        this.roleRetrievedBool = true;
        this.roleModelListSubject.next(roleModelList);
      }, (error) => {
        console.log(error);
      });
    }
  }


  getBooks() {
    if (!this.booksRetrievedBool) {
      let collectionRef = collection(this.firestore, BOOKS_COLLECTION);
      let queryRef = query(collectionRef, where("fileType", "==", 0));
      onSnapshot(queryRef, (value) => {
        this.booksSub.next(value.docs.map(e => e.data() as BookModel));
        this.booksRetrievedBool = true;
        // console.log(value.docs)
      }, (error) => {
        console.log(error);
      })
    }
  }

  getCatalogue() {
    if (!this.catalogueRetrievedBool) {
      let collectionRef = collection(this.firestore, CATALOGUE_COLLECTION);
      let queryRef = query(collectionRef, where("status", "==", true));
      onSnapshot(queryRef, (value) => {
        this.catalogueSub.next(value.docs.map(e => e.data() as Catalogue));
        this.catalogueRetrievedBool = true;
        // console.log(value.docs)
      }, (error) => {
        console.log(error);
      })
    }
  }

  getTagsList() {

    let collectionRef = collection(this.firestore, TAGS_COLLECTION);
    let queryRef = query(collectionRef);
    onSnapshot(queryRef, (value) => {
      this.tagsSub.next(value.docs.map(e => e.data() as TagsModel));
      // console.log(value.docs)
    }, (error) => {
      console.log(error);
    })

  }

  getCatalogueList() {

    let collectionRef = collection(this.firestore, CATALOGUE_COLLECTION);
    let queryRef = query(collectionRef);
    onSnapshot(queryRef, (value) => {
      // console.log(value);

      this.catalogueSub.next(value.docs.map(e => e.data() as Catalogue));
      // console.log(value);
      // console.log(value.docs)
    }, (error) => {
      console.log(error);
    })

  }

  getPlansList() {

    let collectionRef = collection(this.firestore, PLANS_COLLECTION);
    let queryRef = query(collectionRef);
    onSnapshot(queryRef, (value) => {
      this.subscriptionsSub.next(value.docs.map(e => e.data() as SubscriptionModel));
      // console.log(value.docs)
    }, (error) => {
      console.log(error);
    })
  }


}
