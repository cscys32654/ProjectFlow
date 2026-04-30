import mongoose from 'mongoose';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: STATUSES, default: 'Todo' },
  dueDate:     { type: Date, default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

taskSchema.virtual('isOverdue').get(function () {
  return this.dueDate && this.status !== 'Done' && this.dueDate < new Date();
});

taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema);