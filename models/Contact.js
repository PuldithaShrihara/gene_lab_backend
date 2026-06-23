import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  subject: { type: String, default: 'Contact Inquiry' },
  message: { type: String, default: '' },
  preferredContactMethod: { type: String, default: 'phone' },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
