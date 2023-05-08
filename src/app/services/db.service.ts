import { PlanModel } from './../utils/PlanModel';
import { FirebaseApp } from '@angular/fire/app';
import { NgZone } from '@angular/core';
import { TagsModel } from 'src/app/utils/TagsModel';
import { TAGS_COLLECTION } from 'src/app/utils/constants';
import { BookModel } from './../utils/BookModel';
import { BOOKS_COLLECTION, PLANS_COLLECTION } from './../utils/constants';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Firestore, getFirestore, collection, where, query, onSnapshot, getDocs, orderBy, limit, collectionGroup } from '@angular/fire/firestore';
import { FirebaseStorage, getStorage } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { BehaviorSubject, of, map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DbService {

  storage: FirebaseStorage = getStorage(this.auth.app);

  booksSub: BehaviorSubject<BookModel[]> = new BehaviorSubject<BookModel[]>([]);
  tagsSub: BehaviorSubject<TagsModel[]> = new BehaviorSubject<TagsModel[]>([]);
  plansSub: BehaviorSubject<PlanModel[]> = new BehaviorSubject<PlanModel[]>([]);
  booksRetrievedBool: boolean = false;

  constructor(public firestore: Firestore, private auth: AuthService) {
    this.getTagsList();
  }

  // canWriteCheck(url?) {
  //   if (JSON.parse(localStorage.getItem("admin")).roles[url || this.router.url.replace("/", "").split("/")[0]] === 2) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

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

  getPlansList() {

    let collectionRef = collection(this.firestore, PLANS_COLLECTION);
    let queryRef = query(collectionRef);
    onSnapshot(queryRef, (value) => {
      this.plansSub.next(value.docs.map(e => e.data() as PlanModel));
      // console.log(value.docs)
    }, (error) => {
      console.log(error);
    })


  }


}
