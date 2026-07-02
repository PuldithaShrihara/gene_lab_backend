import mongoose from 'mongoose';

const TestAllocationSchema = new mongoose.Schema({
  userId: {
    type: String, // Google UID or internal ID if needed
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  userEmail: {
    type: String,
    default: ''
  },
  patientId: {
    type: String,
    default: ''
  },
  patientName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true,
    enum: [
      'Genetic Counselling',
      'Wellness Genomics',
      'Me360 Wellness Blueprint',
      'NIPT',
      'Clinical Genetic Panel',
      'Whole Exome Sequencing',
      'Whole Genome Sequencing',
      'Cancer Genetics',
      'Genetic Report Interpretation',
      'Other'
    ]
  },
  status: {
    type: String,
    default: 'Allocated',
    enum: [
      'Allocated',
      'Sample Pending',
      'Sample Collected',
      'Processing',
      'Report Ready',
      'Completed',
      'Cancelled'
    ]
  },
  notes: {
    type: String,
    default: ''
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const TestAllocation = mongoose.model('TestAllocation', TestAllocationSchema);

export default TestAllocation;
