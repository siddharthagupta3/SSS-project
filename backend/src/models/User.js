const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: false,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in queries by default
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'active',
    },
    authVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    // Gmail / Email Verification Fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    otpHash: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    otpLastSent: {
      type: Date,
      select: false,
    },
    otpPurpose: {
      type: String,
      enum: ['', 'register', 'login', 'reset'],
      default: '',
      select: false,
    },
    totpSecret: {
      type: String,
      select: false,
    },
    totpEnabled: {
      type: Boolean,
      default: false,
    },
    backupCodes: {
      type: [{ codeHash: { type: String }, used: { type: Boolean, default: false } }],
      select: false,
      default: [],
    },
    adminChallengeId: {
      type: String,
      select: false,
    },
    adminOtpHash: {
      type: String,
      select: false,
    },
    adminOtpExpires: {
      type: Date,
      select: false,
    },
    adminOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    adminOtpLastSent: {
      type: Date,
      select: false,
    },
    adminTotpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    adminPasswordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    adminLockUntil: {
      type: Date,
      select: false,
    },
    // Google OAuth Fields
    googleId: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['', 'Male', 'Female', 'Other', 'Prefer not to say'],
      default: '',
    },
    addresses: [
      {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        houseNumber: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        landmark: { type: String, default: '', trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
        country: { type: String, default: 'India' },
        isDefault: { type: Boolean, default: false },
      },
    ],
    // User Wishlist
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    // Admin-only fields
    storeName: {
      type: String,
      default: '',
    },
    storeAddress: {
      type: String,
      default: '',
    },
    storeDescription: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    storeLogo: {
      type: String,
      default: '',
    },
    sellerStatus: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied',
    },
    sellerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    sellerAddress: {
      type: String,
      default: '',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    // Detailed Indian Shipping Address
    address: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      houseNumber: { type: String, default: '' }, // Flat/House No., Building Name
      street: { type: String, default: '' },      // Street, Area, Sector, Village
      landmark: { type: String, default: '' },    // Nearby landmark (optional)
      city: { type: String, default: '' },        // City / Town
      state: { type: String, default: '' },       // State / UT
      postalCode: { type: String, default: '' },  // 6-Digit PIN Code
      addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
      country: { type: String, default: 'India' },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
