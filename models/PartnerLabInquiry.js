import mongoose from 'mongoose';

const partnerLabInquirySchema = new mongoose.Schema({
  labName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, default: '' },
  services: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('PartnerLabInquiry', partnerLabInquirySchema);
