import { Component, OnInit } from '@angular/core';
import { Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { AdminModel } from 'src/app/utils/AdminModel';
import { RoleModel } from 'src/app/utils/RoleModel';
import { ADMIN_USERS_COLLECTION } from 'src/app/utils/constants';

export enum ROLES { NONE, READ, READ_WRITE };

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  // updateMode: boolean = false;
  // adminModel: AdminModel;
  // adminModelList: AdminModel[] = [];
  // allAdmins: AdminModel[] = []

  roles: RoleModel[] = [];
  admins: AdminModel[] = [];

  adminForm: FormGroup;
  roleForm: FormGroup;

  ROLES = ROLES;
  adminModel: AdminModel;

  loader: boolean = false;
  updation: boolean = false;
  canWrite: boolean;

  constructor(

    private db: DbService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private modalService: NgbModal

  ) { }

  ngOnInit() {
    // this.fetchAdminsFromAdminCollection();
    // this.canWrite = this.db.canWriteCheck() || false;
    this.getRoles();
    this.getAdmins();
  }

  // async initViews() {
  //   this.roleModelListSub = this.db.roleModelListSubject.subscribe((data) => {
  //     if (data != null) {
  //       this.roleModelList = data;
  //     }
  //   });
  // this.adminModelSub = this.authService.adminModelSubject.subscribe((data) => {
  //   if (data != null) {
  //     this.loggedInadminModel = data;
  //   }
  // });

  // this.getMonthlyUsers();
  // }

  // ngOnDestroy() {
  // if (this.adminModelListSub != undefined) {
  //   this.adminModelListSub.unsubscribe();
  // }
  // if (this.roleModelListSub != undefined) {
  //   this.roleModelListSub.unsubscribe();
  // }
  // if (this.adminModelSub != undefined) {
  //   this.adminModelSub.unsubscribe();
  // }
  // if (this.extraModelSub != undefined) {
  //   this.extraModelSub.unsubscribe();
  // }

  //   this.paramRouteSub.unsubscribe();
  // }

  // addUserDialog(addUserDialogContent, updateMode, adminModel) {
  //   this.updateMode = updateMode;
  //   if (this.updateMode) {
  //     this.adminModel = adminModel;

  //     for (var i = 0; i < this.roleModelList.length; i++) {
  //       if (this.adminModel.roles[this.roleModelList[i].key] == undefined) {
  //         this.roleModelList[i].selected = 0;
  //       } else {
  //         this.roleModelList[i].selected = this.adminModel.roles[this.roleModelList[i].key];
  //       }
  //     }
  //     this.adminUserForm = this.fb.group({
  //       name: [this.adminModel.name, Validators.required],
  //       email: [this.adminModel.email, Validators.required],
  //       password: [this.adminModel.password, Validators.required],
  //       status: [this.adminModel.status, Validators.required],
  //     });
  //   } else {
  //     for (var i = 0; i < this.roleModelList.length; i++) {
  //       this.roleModelList[i].selected = 0;
  //     }
  //     this.adminUserForm = this.fb.group({
  //       name: ["", Validators.required],
  //       mobile: ["", Validators.required],
  //       email: ["", Validators.required],
  //       password: ["", Validators.required],
  //       status: [true, Validators.required],
  //     });
  //   }
  //   this.modalService.open(addUserDialogContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  // }





  // initializeForm(obj: AdminModel = null) {
  //   this.tempFile = null
  //   if (obj === null) {
  //     this.adminUserForm = this.fb.group({
  //       authId: [doc(collection(this.db.firestore, ADMIN_USERS_COLLECTION)).id],

  //       name: [null],
  //       email: [null],
  //       password: [null],
  //       status: [true], 
  //       roles: [[]], 
  //       createdOn: [Timestamp.now()],
  //     });
  //   } else {
  //     this.adminUserForm = this.fb.group({

  //       adminId: [obj.adminId],
  //       name: [obj.name],
  //       email: [obj.email],
  //       password: [obj.password],
  //       status: [obj.status],
  //       roles: [obj.roles],
  //       createdOn: [obj.createdOn],
  //     });
  //   }
  // }

  // openAdminModal(modalRef: any, obj: AdminModel = null) {
  //   this.initializeForm(obj);
  //   this.modalService.open(modalRef, { size: 'lg' });
  // }

  async getAdmins() {
    const collectionRef = collection(this.db.firestore, ADMIN_USERS_COLLECTION);
    try {
      const docs: any = await getDocs(collectionRef);
      this.admins = docs.docs.map((admin) => admin.data());
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      this.loader = false; // Set loader to false when data is fetched (or error occurs)
    }
  }

  // async fetchAdminsFromAdminCollection() {
  //   const firestore = getFirestore();

  //   try {
  //     const adminsCollectionRef = collection(firestore, 'UserAdmins');
  //     const adminsQuerySnapshot = await getDocs(adminsCollectionRef);

  //     this.adminModelList = [];

  //     for (const adminDoc of adminsQuerySnapshot.docs) {
  //       const adminData = adminDoc.data() as AdminModel;
  //       this.adminModelList.push(adminData);
  //     }
  //     console.log('Admin Data:', this.adminModelList);
  //   } catch (error) {
  //     console.error('Error fetching admin data:', error);
  //   }
  // }

  async getRoles() {
    const docRef = doc(this.db.firestore, `roles/roles`);
    const roleDoc: any[] = (await getDoc(docRef)).data()['roleList'];
    this.roles = roleDoc.map(e => ({
      ...e,
      selected: 0
    }));
  }

  openAdminModal(modal, adminModel: AdminModel = null) {
    this.modalService.open(modal);
    if (adminModel == null) {
      this.updation = false;
      this.adminForm = this.fb.group({
        name: [""],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        adminId: [doc(collection(this.db.firestore, ADMIN_USERS_COLLECTION)).id],
        // authId: [""],
        status: [true],
        roles: [null],
        createdOn: [Timestamp.now()],
      });
    } else {
      this.updation = true;
      this.adminForm = this.fb.group({
        name: [adminModel.name],
        email: [adminModel.email, [Validators.required, Validators.email]],
        password: [adminModel.password, [Validators.required, Validators.minLength(6)]],
        adminId: [adminModel.adminId],
        // authId: [adminModel.authId],
        status: [adminModel.status],
        roles: [adminModel.roles],
        createdOn: [adminModel.createdOn],
      });
    }
  }

  openAdminRoleModel(modal, adminId, roles: any = null, openModalBool: boolean = true) {
    if (openModalBool) this.modalService.open(modal, { size: 'lg' });
    if (roles == null) {
      this.roleForm = this.fb.group({
        adminId: [adminId],
        roles: this.fb.array(this.roles.map(e => this.fb.group({
          key: [e.key],
          title: [e.title],
          selected: [e.selected]
        })))
      })
    } else {

      this.roleForm = this.fb.group({
        adminId: [adminId],
        roles: this.fb.array(this.roles.map((e, idx) => this.fb.group({
          key: [e.key],
          title: [e.title],
          selected: [roles[e.key] || e.selected]
        })))
      })
    }
  }

  registerAdmin(form: FormGroup, roleModal) {
    this.loader = true;
    let formValues: AdminModel = { ...form.value };

    const docRef = doc(this.db.firestore, `${ADMIN_USERS_COLLECTION}/${formValues.adminId}`);
    setDoc(docRef, { ...formValues }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        if (!this.updation) {
          this.admins.splice(0, 0, formValues);
          this.openAdminRoleModel(roleModal, formValues.adminId);
          this.toast.show("Admin Added Successfully");
        } else {
          let index = this.admins.findIndex((x) => x.adminId === formValues.adminId);
          this.admins[index] = { ...formValues };
          this.toast.show("Admin Updated Successfully");
        }
      }, (error) => {
        this.loader = false;
        this.toast.warning("Something Went Wrong!! Please Try Again")
      })
  }

  updateAdminRoles(form: FormGroup) {
    let formValues: any = { ...form.value };
    let roles: any = {};
    for (let role of formValues['roles']) roles[role.key] = role.selected;

    const docRef = doc(this.db.firestore, `${ADMIN_USERS_COLLECTION}/${formValues.adminId}`);
    updateDoc(docRef, { roles: roles })
      .then(() => {
        let index = this.admins.findIndex((x) => x.adminId === formValues.adminId);
        this.admins[index]['roles'] = roles;
        this.toast.show("Admin Roles Updated");
        this.modalService.dismissAll();
      }, (error) => {
        this.toast.warning("Something Went Wrong!! Please Try Again")

      })
  }


  viewadminDetails(modal, adminObj) {
    this.modalService.open(modal, { size: "sm" });
    this.adminModel = adminObj;
  }

  // async saveToFirestore() {
  //   this.loader = true;
  //   let values: AdminModel = { ...this.adminUserForm.value };

  //   let docRef = doc(collection(this.db.firestore, ADMIN_USERS_COLLECTION), values.authId);
  //   setDoc(docRef, { ...values }, { merge: true })
  //     .then(() => {

  //       this.loader = false;
  //       this.modalService.dismissAll();

  //       this.toast.success("Admin Saved Successfully", "")
  //     }, (error) => {
  //       console.log(error);
  //       this.loader = false;
  //       this.toast.warning("Something went wrong! Please try again.", "");
  //     });
  // }





}
