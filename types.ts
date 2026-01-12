
export type EquipmentItem = {
  id: string;
  type: string;
  socket: string;
};

export type StaffMember = {
  id: string;
  role: string;
};

export type PaperworkFile = {
  file: File | null;
  expiry: string;
  link?: string;
};

export interface VendorFormData {
  vendorId: string;
  tradingName: string;
  contactName: string;
  email: string;
  phone: string;
  standType: 'Van' | 'Shack' | '';
  externalSpace: '1x1m' | '2x2m' | '3x3m' | 'None';
  externalSpaceReason: string;
  branding: File | null;
  powerSource: 'FUME/Venue Supply' | 'Own Generator' | '';
  equipment: EquipmentItem[];
  paperwork: { [key: string]: PaperworkFile };
  paperworkStatus: 'Yes' | 'Yes but need to renew documents' | 'No' | '';
  menu: {
    dish3: { desc: string; ingredients: string; photo: File | null };
    dish75: { desc: string; ingredients: string; photo: File | null };
    dish15: { desc: string; ingredients: string; photo: File | null };
  };
  staff: StaffMember[];
  vehicleReg: string;
  instagram: string;
  comments: string;
}
