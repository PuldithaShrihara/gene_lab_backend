import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  patientName: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: String, default: '' },
  appointmentType: { type: String, required: true },
  location: { type: String, required: true },
  clinicLocation: { type: String, default: '' },
  mode: { type: String, required: true },
  preferredMode: { type: String, default: '' },
  reason: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Pending' },
  source: { type: String, default: 'Website Appointment Page' },
  date: { type: String, default: '' },
  preferredDate: { type: String, default: '' },
  timeSlot: { type: String, default: 'TBD' },
  preferredTimeSlot: { type: String, default: '' },
  geneticReport: { type: String, default: null },
  geneticReportName: { type: String, default: '' },
  medicalReport: { type: String, default: null },
  medicalReportName: { type: String, default: '' },
  referralReport: { type: String, default: null },
  referralLetterName: { type: String, default: '' },
  consent: { type: Boolean, required: true }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
