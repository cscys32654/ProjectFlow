import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

projectSchema.pre('save', function (next) {
  const adminStr = this.adminId.toString();
  const isMember = this.members.some(m => m.toString() === adminStr);
  if (!isMember) this.members.push(this.adminId);
  next();
});

export default mongoose.model('Project', projectSchema);