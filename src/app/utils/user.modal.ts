import { Timestamp } from "@angular/fire/firestore";
export class User {
  aadharNumber: number;
  aadharPhotoUrl: string;
  accountType: number;
  address: string;
  authId: string;
  businessDetails: BusinessDetails;
  businessNature: BusinessNature;
  creationDate: Timestamp;
  deviceToken: string;
  email: string;
  enableNotification: boolean;
  name: string;
  panNumber: string;
  panNumberUrl: string;
  phoneNumber: string;
  profilePicUrl: string;
  propertyType: number;
  socialUrl: string;
  termsAccepted: boolean;
  userHashCode: string;
  isVerFied: boolean;
  houseNumber: any;
  street: any;
  pincode: any;
  panVerificationStatus: any;
  aadharVerificationStatus: any;
  businessPanVerificationStatus: any;
  gstVerificationStatus: any;
  isVerified: any;
  facebookProfile: any;
  matchingProfiles: any[];
}

export class BusinessDetails {
  businessAddress: string;
  businessGst: string;
  businessName: string;
  businessPan: string;
  businessPropertyType: number;
}

export class BusinessNature {
  businessNature: string;
  docId: string;
}
