const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ROLES = ['admin', 'counsellor', 'docs_team', 'app_team', 'interview_team', 'visa_team', 'student']

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    is2faEnabled: { type: Boolean, default: false },
    twoFaSecret: { type: String, select: false },
    timezone: { type: String, default: 'UTC' },
    profilePictureUrl: { type: String },
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
)

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ lastActiveAt: -1 })

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// ── Instance method: compare password ─────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Instance method: is account locked ────────────────────────────────────
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now()
}

// ── Remove sensitive fields from JSON output ───────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.twoFaSecret
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  delete obj.failedLoginCount
  return obj
}

module.exports = mongoose.model('User', userSchema)
module.exports.ROLES = ROLES
