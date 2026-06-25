import mongoose from 'mongoose';

const partnerLabInquirySchema = new mongoose.Schema({
  labName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, default: '' },
  services: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  userId: { type: String, default: '' },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  userPhoto: { type: String, default: '' },
  authProvider: { type: String, default: 'google' },
  submittedBySignedInUser: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('PartnerLabInquiry', partnerLabInquirySchema);
