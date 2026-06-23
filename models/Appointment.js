import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: String, required: true },
  appointmentType: { type: String, required: true },
  location: { type: String, required: true },
  mode: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: String, default: '' },
  timeSlot: { type: String, default: 'TBD' },
  geneticReport: { type: String, default: null },
  medicalReport: { type: String, default: null },
  referralReport: { type: String, default: null },
  consent: { type: Boolean, required: true }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
