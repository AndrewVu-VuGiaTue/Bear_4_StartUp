import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
