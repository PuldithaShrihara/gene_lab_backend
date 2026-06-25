import mongoose from 'mongoose';

const geneticTestRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: String, default: '' },
  testCategory: { type: String, required: true },
  reason: { type: String, default: '' },
  referralDetails: { type: String, default: '' },
  preferredContactMethod: { type: String, default: 'email' },
  consent: { type: Boolean, required: true },
  status: { type: String, default: 'Pending' },
  userId: { type: String, default: '' },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  userPhoto: { type: String, default: '' },
  authProvider: { type: String, default: 'google' },
  submittedBySignedInUser: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('GeneticTestRequest', geneticTestRequestSchema);
