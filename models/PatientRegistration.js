import mongoose from 'mongoose';

const patientRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, default: '' },
  age: { type: String, default: '' },
  gender: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, default: '' },
  nic: { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactNumber: { type: String, default: '' },
  reason: { type: String, default: '' },
  medicalCondition: { type: String, default: '' },
  currentMedications: { type: String, default: '' },
  uploadedReports: { type: [String], default: [] },
  consent: { type: Boolean, required: true },
  status: { type: String, default: 'Registered' }
}, { timestamps: true });

export default mongoose.model('PatientRegistration', patientRegistrationSchema);
