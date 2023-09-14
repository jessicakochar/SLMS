import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, getDocs, getFirestore } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MemberModel } from 'src/app/utils/MemberModel';

export class CsvFormat {
  static formatPredictions(members: MemberModel[]): string {
    const csvRows = members.map(member => {
      const {
        name,
        email,
        address,
        age,
        phone,
        userId,
        // locationInfo,
        // weatherInfo,
      } = member;

      return (
        `${name},` +
        `${email},` +
        `${address},` +
        `${age},` +
        `${phone},` +
        `${userId},`
      );
    });

    const header = 'User,Email, Address, Age, Phone, UserId';
    return [header, ...csvRows].join('\n');
  }
}

@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.scss']
})
export class UserHistoryComponent implements OnInit {

  members: MemberModel[] = [];
  memberModel: MemberModel;
  memberModelList: MemberModel[] = [];
  phoneNumber: string = '';
  userData: MemberModel | null = null;
  userDataa: MemberModel[] = [];
  @ViewChild('userDataModal') userDataModal: any;

  constructor(

    private modalService: NgbModal,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
    // this.getTagsList();
    this.getMembers();
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

  searchUserData() {
    const user = this.memberModelList.find(member => member.phone === this.phoneNumber);
    if (user) {
      this.userData = user;
      // this.modalService.open(this.userDataModal)
      console.log("working");
      // $('#userDataModal').modal('show'); // If you want to use jQuery for modal, otherwise use Angular's NgbModal
    } else {
      this.userData = null;
    }
  }

  exportToCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Data exported to ${filename}`);
    this.toastr.success('Member Downloaded');
  }

  exportMemberToCSV(): void {
    if (this.userData) { // Check if userData is not null
      const filename = 'user.csv';
      const csvContent = CsvFormat.formatPredictions([this.userData]); // Wrap userData in an array
      this.exportToCSV(csvContent, filename);
    } else {
      console.warn('No user data available to export.');
    }
  }


}



