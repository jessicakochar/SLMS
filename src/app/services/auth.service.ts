import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp, FirebaseApp } from '@angular/fire/app';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, IdTokenResult, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, getFirestore, query, updateDoc, where } from '@angular/fire/firestore';
import { resolve } from 'path';
import { from, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminModel } from '../utils/AdminModel';
import { ADMIN_USERS_COLLECTION, USERS_COLLECTION } from '../utils/constants';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated = false;
  user$: Observable<IdTokenResult | null>;
  // app: FirebaseApp = initializeApp(environment.firebase, 'customapp');

  constructor(
    private router: Router,
    private firestore: Firestore,
    public auth: Auth
  ) {
    this.auth.onAuthStateChanged((authReposnse) => {
      if (authReposnse) {
        this.fetchUserDocFromFirestore(authReposnse.uid);
        this.user$ = from(authReposnse.getIdTokenResult());
      } else {
        this.user$ = of(null);
      }
    }, (authStateError) => {
      console.log(authStateError);
    });
  }

  login() {
    this.isAuthenticated = true;
  }

  // Simulate a logout process by setting the isAuthenticated variable to false
  // logout() {
  //   this.isAuthenticated = false;
  // }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  fetchUserDocFromFirestore(authId) {
    const queryRef = query(
      collection(this.firestore, ADMIN_USERS_COLLECTION),
      where('authId', '==', authId)
    );

    getDocs(queryRef)
      .then((response) => {
        const adminModel: AdminModel = response.docs.map((admin) => admin.data() as AdminModel)[0];
        if (!adminModel.status) this.logout();

        localStorage.setItem('admin', JSON.stringify(adminModel));
      })
  }

  fetchUserFromFirestore(value: { email?: string; password?: string }) {
    return new Promise<any>(async (resolve, reject) => {
      const queryRef = query(
        collection(this.firestore, ADMIN_USERS_COLLECTION),
        where('email', '==', value.email.trim())
      );

      const response = await getDocs(queryRef);
      if (response.docs.length !== 0) {
        // Login User or Registered User - Firebase Auth
        const adminModel: AdminModel = response.docs.map(e => e.data() as AdminModel)[0];
        // Access Denied for the user
        if (!adminModel.status) return reject('Access Denied');

        if (adminModel.authId && adminModel.authId.length === 0) {
          // Register New User
          this.addUserToAuthentication(value, adminModel.adminId)
            .then((registerResponse) => {
              localStorage.setItem('admin', JSON.stringify(adminModel));
              resolve(registerResponse);
            })
            .catch((authError) => reject(authError));
        } else {
          // Login Existing User
          this.loginUser(value)
            .then((loginResponse) => {
              localStorage.setItem('admin', JSON.stringify(adminModel));
              resolve(loginResponse)
            })
            .catch((error) => reject(error));
        }
      } else {
        // throws Error - User Not Found in database or Notify the user
        return reject(`User not existed with this ${value.email.trim()}`);
      }
    });
  }

  // loginUser(value: { email?: string; password?: string }) {
  //   return new Promise<any>((resolve, reject) => {
  //     signInWithEmailAndPassword(this.auth, value.email.trim(), value.password.trim())
  //       .then((response) => {
  //         this.user$ = from(response.user.getIdTokenResult());
  //         this.router.navigate(['/']);
  //         resolve(response);
  //       }, (authError) => {
  //         if (authError.code === 'auth/user-not-found') {
  //           reject('user does not exist, please check email !');
  //         } else if (authError.code === 'auth/user-disabled') {
  //           reject('user is disabled, please contact admin !');
  //         } else if (authError.code === 'auth/wrong-password') {
  //           reject('Incorrect password !!!');
  //         } else {
  //           reject('Error Occurred, please try again !');
  //         }
  //       })
  //   })
  // }

  loginUser(value: { email?: string; password?: string }) {
    return new Promise<any>((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, value.email.trim(), value.password.trim())
        .then((response) => {
          this.user$ = from(response.user.getIdTokenResult());

          // Use replaceUrl to replace the current URL with the new one
          this.router.navigate(['/'], { replaceUrl: true });

          resolve(response);
        }, (authError) => {
          if (authError.code === 'auth/user-not-found') {
            reject('user does not exist, please check email !');
          } else if (authError.code === 'auth/user-disabled') {
            reject('user is disabled, please contact admin !');
          } else if (authError.code === 'auth/wrong-password') {
            reject('Incorrect password !!!');
          } else {
            reject('Error Occurred, please try again !');
          }
        });
    });
  }

  addUserToAuthentication(value: { email?: string; password?: string }, adminId: string) {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, value.email.trim(), value.password.trim())
        .then(async (response) => {
          this.user$ = from(response.user.getIdTokenResult());
          this.router.navigate(['/']);
          resolve(response);

          // Update user document with auth id
          updateDoc(
            doc(this.firestore, `${ADMIN_USERS_COLLECTION}/${adminId}`),
            { authId: response.user.uid }
          );
        }, (authError) => reject(authError.message))
    })
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
      localStorage.clear();
      console.log("logged out");
    }, (error) => console.log(">>> Signout Error: ", error))
  }
}
