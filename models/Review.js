import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serviceType: { type: String, default: 'General Consultation' },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  consent: { type: Boolean, required: true },
  status: { type: String, default: 'Pending' },
  userId: { type: String, default: '' },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  userPhoto: { type: String, default: '' },
  authProvider: { type: String, default: 'google' },
  submittedBySignedInUser: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
