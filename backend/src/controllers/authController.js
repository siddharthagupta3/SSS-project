const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmailOTP = require('../utils/sendEmail');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
const emailRateMap = new Map();

const passwordIsValid = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /\d/.test(password);

const checkEmailRateLimit = (email) => {
  const now = Date.now();
  const key = email.toLowerCase();
  const entry = emailRateMap.get(key) || [];
  const recent = entry.filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  if (recent.length >= 5) return false;
  recent.push(now);
  emailRateMap.set(key, recent);
  return true;
};

const issueOTP = async (user, purpose, force = false) => {
  if (!force && user.otpLastSent && Date.now() - user.otpLastSent.getTime() < 30 * 1000) {
    const wait = Math.ceil((30 * 1000 - (Date.now() - user.otpLastSent.getTime())) / 1000);
    const error = new Error(`Please wait ${wait} seconds before requesting another OTP`);
    error.statusCode = 429;
    throw error;
  }
  const otp = crypto.randomInt(100000, 1000000).toString();
  user.otpHash = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpLastSent = new Date();
  user.otpPurpose = purpose;
  await user.save();
  const delivery = await sendEmailOTP({ email: user.email, name: user.name, otp, purpose });
  if (delivery?.success === false && process.env.NODE_ENV === 'production') {
    const error = new Error(delivery.error || 'Could not send the verification code. Please try again.');
    error.statusCode = 502;
    throw error;
  }
};

/**
 * @desc    Register a new customer account & send email OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name || !normalizedEmail || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields (name, email, password)');
    }
    if (!passwordIsValid(password)) {
      res.status(400);
      throw new Error('Password must be at least 8 characters and include at least one number');
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }
    if (!checkEmailRateLimit(normalizedEmail)) {
      res.status(429);
      throw new Error('Too many requests for this email. Please try again later.');
    }
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified && existingUser.status === 'active') {
      res.status(400);
      throw new Error('An account with this email already exists');
    }
    let user = existingUser;
    if (user) {
      user.name = name.trim();
      user.password = password;
      user.status = 'pending';
      user.isEmailVerified = false;
    } else {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'user',
        status: 'pending',
        isEmailVerified: false,
      });
    }
    await issueOTP(user, 'register', true);
    res.status(201).json({
      success: true,
      message: 'Verification OTP sent to your email',
      data: { email: user.email, status: 'pending', isEmailVerified: false },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user — send login OTP instead of immediate JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password +googleId +authVersion');
    if (!user || user.role === 'admin') {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    if (user.googleId && !user.password) {
      res.status(400);
      throw new Error('Please use Google login');
    }
    if (!(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    if (user.status === 'pending' || !user.isEmailVerified) {
      await issueOTP(user, 'register');
      res.status(403).json({
        success: false,
        message: 'Email not verified',
        requiresVerification: true,
        data: { email: user.email },
      });
      return;
    }

    // ✅ Task 3: Send login OTP instead of immediate JWT
    if (!checkEmailRateLimit(normalizedEmail)) {
      res.status(429);
      throw new Error('Too many login attempts. Please try again later.');
    }
    await issueOTP(user, 'login');
    res.status(200).json({
      success: true,
      requiresOtp: true,
      message: `A login verification code has been sent to ${user.email}`,
      data: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify login OTP and return JWT token
 * @route   POST /api/auth/verify-login-otp
 * @access  Public
 */
const verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^\d{6}$/.test(String(otp || ''))) {
      res.status(400);
      throw new Error('Email and 6-digit OTP are required');
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select('+otpHash +otpExpires +otpAttempts +otpPurpose +authVersion');

    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    if (user.otpPurpose !== 'login' || !user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(400);
      throw new Error('Login code has expired. Please try logging in again.');
    }

    const valid = await bcrypt.compare(String(otp), user.otpHash);
    if (!valid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 3) {
        user.otpHash = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        user.otpPurpose = '';
        await user.save();
        res.status(400);
        throw new Error('Too many wrong attempts. Please log in again.');
      }
      await user.save();
      res.status(400);
      throw new Error(`Invalid login code. ${3 - user.otpAttempts} attempt(s) remaining.`);
    }

    // Clear OTP fields
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = '';
    user.otpLastSent = undefined;
    await user.save();

    const token = generateToken(user._id, user.role, undefined, user.authVersion || 0);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
        address: user.address,
        sellerStatus: user.sellerStatus || 'not_applied',
        storeName: user.storeName || '',
        storeDescription: user.storeDescription || '',
        storeLogo: user.storeLogo || '',
        sellerPhone: user.sellerPhone || '',
        sellerAddress: user.sellerAddress || '',
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend Login OTP
 * @route   POST /api/auth/login-otp/resend
 * @access  Public
 */
const sendLoginOTP = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }
    if (!checkEmailRateLimit(email)) {
      res.status(429);
      throw new Error('Too many requests. Please try again later.');
    }
    const user = await User.findOne({ email, status: 'active', isEmailVerified: true });
    if (!user) {
      // Don't reveal user existence
      return res.status(200).json({ success: true, message: 'If an account exists, a code has been sent.' });
    }
    await issueOTP(user, 'login');
    res.status(200).json({ success: true, message: `Login code sent to ${user.email}` });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend Gmail Verification OTP
 * @route   POST /api/auth/send-otp
 * @access  Public / Authenticated
 */
const sendVerificationOTP = async (req, res, next) => {
  try {
    const email = String(req.body.email || req.user?.email || '').trim().toLowerCase();

    if (!email) {
      res.status(400);
      throw new Error('Email address is required');
    }

    if (!checkEmailRateLimit(email)) {
      res.status(429);
      throw new Error('Too many requests for this email. Please try again later.');
    }
    const user = await User.findOne({ email }).select('+otpLastSent');
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email');
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified',
      });
    }

    await issueOTP(user, 'register');

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${user.email}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 6-digit Email OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public / Authenticated
 */
const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^\d{6}$/.test(String(otp || ''))) {
      res.status(400);
      throw new Error('Email and 6-digit OTP code are required');
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select('+otpHash +otpExpires +otpAttempts +otpPurpose +authVersion');

    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    if (user.isEmailVerified && user.status !== 'pending') {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified',
        data: { isEmailVerified: true },
      });
    }
    if (user.otpPurpose !== 'register' || !user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(400);
      throw new Error('Verification code has expired. Please request a new one.');
    }
    const valid = await bcrypt.compare(String(otp), user.otpHash);
    if (!valid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 3) {
        await issueOTP(user, 'register', true);
        await user.save();
        res.status(400);
        throw new Error('Too many wrong attempts. A new OTP was sent.');
      }
      await user.save();
      res.status(400);
      throw new Error('Invalid verification code');
    }
    user.isEmailVerified = true;
    user.status = 'active';
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = '';
    user.otpLastSent = undefined;
    await user.save();
    const token = generateToken(user._id, user.role, undefined, user.authVersion || 0);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
        token,
        sellerStatus: user.sellerStatus || 'not_applied',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request a password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400);
      throw new Error('Email address is required');
    }
    if (!checkEmailRateLimit(email)) {
      res.status(429);
      throw new Error('Too many requests for this email. Please try again later.');
    }

    const user = await User.findOne({ email }).select('+otpLastSent');
    if (user && user.status !== 'pending') {
      try {
        await issueOTP(user, 'reset');
      } catch (error) {
        if (error.statusCode !== 429) throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a password reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify reset OTP and set a new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!email || !/^\d{6}$/.test(otp) || !password) {
      res.status(400);
      throw new Error('Email, 6-digit OTP and new password are required');
    }
    if (password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }
    if (!passwordIsValid(password)) {
      res.status(400);
      throw new Error('Password must be at least 8 characters and include at least one number');
    }

    const user = await User.findOne({ email })
      .select('+password +otpHash +otpExpires +otpAttempts +otpPurpose +otpLastSent +authVersion');
    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset code');
    }
    if (user.otpPurpose !== 'reset' || !user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(400);
      throw new Error('Reset code has expired. Please request a new one.');
    }

    const valid = await bcrypt.compare(otp, user.otpHash);
    if (!valid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 3) {
        await issueOTP(user, 'reset', true);
        res.status(400);
        throw new Error('Too many wrong attempts. A new OTP was sent.');
      }
      await user.save();
      res.status(400);
      throw new Error('Invalid reset code');
    }

    user.password = password;
    user.isEmailVerified = true;
    user.status = 'active';
    user.authVersion = (user.authVersion || 0) + 1;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = '';
    user.otpLastSent = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in again.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private (Authenticated)
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified || false,
          address: user.address,
          phone: user.address?.phone || '',
          storeName: user.storeName || '',
          storeAddress: user.storeAddress || '',
          storeDescription: user.storeDescription || '',
          storeLogo: user.storeLogo || '',
          sellerStatus: user.sellerStatus || 'not_applied',
          sellerPhone: user.sellerPhone || '',
          sellerAddress: user.sellerAddress || '',
          supportEmail: user.supportEmail || '',
          profilePhoto: user.profilePhoto || '',
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile & complete Indian shipping address
 * @route   PUT /api/auth/profile
 * @access  Private (Authenticated)
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password +authVersion');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already registered by another user');
      }
      user.email = req.body.email.toLowerCase();
      user.isEmailVerified = false; // Reset verification if email changed
    }

    if (req.body.password) {
      if (!passwordIsValid(req.body.password)) {
        res.status(400);
        throw new Error('New password must be at least 8 characters and include at least one number');
      }
      user.password = req.body.password;
    }

    if (req.body.address) {
      user.address = {
        fullName: req.body.address.fullName || user.address?.fullName || user.name,
        phone: req.body.address.phone || user.address?.phone || '',
        houseNumber: req.body.address.houseNumber || user.address?.houseNumber || '',
        street: req.body.address.street || user.address?.street || '',
        landmark: req.body.address.landmark || user.address?.landmark || '',
        city: req.body.address.city || user.address?.city || '',
        state: req.body.address.state || user.address?.state || '',
        postalCode: req.body.address.postalCode || user.address?.postalCode || '',
        addressType: req.body.address.addressType || user.address?.addressType || 'Home',
        country: req.body.address.country || 'India',
      };
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id, updatedUser.role, undefined, updatedUser.authVersion || 0);

    res.status(200).json({
      success: true,
      message: 'Profile and address updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified,
        address: updatedUser.address,
        token,
        sellerStatus: updatedUser.sellerStatus || 'not_applied',
        storeName: updatedUser.storeName || '',
        storeDescription: updatedUser.storeDescription || '',
        storeLogo: updatedUser.storeLogo || '',
        sellerPhone: updatedUser.sellerPhone || '',
        sellerAddress: updatedUser.sellerAddress || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth2 Sign-In / Account Creation with Full Verification
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(503);
      throw new Error('Google Sign-In is not configured');
    }
    if (!credential) {
      res.status(400);
      throw new Error('Google credential is required');
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (googleError) {
      res.status(401);
      console.error('Google ID token verification failed:', googleError.message);
      throw new Error('Google authentication failed');
    }

    if (!payload?.email || payload.email_verified !== true) {
      res.status(401);
      throw new Error('Google authentication failed');
    }

    const googleEmail = payload.email;
    const googleName = payload.name;
    const googlePicture = payload.picture;
    const googleSub = payload.sub;

    // Find user by email or googleId
    let user = await User.findOne({ email: googleEmail.toLowerCase() });

    if (user) {
      if (user.role === 'admin') {
        res.status(403);
        throw new Error('Admin accounts must use secure admin login');
      }
      // User exists - update verified status & avatar
      user.isEmailVerified = true;
      if (googlePicture) user.avatar = googlePicture;
      if (googleSub) user.googleId = googleSub;
      await user.save();
    } else {
      // Create new user authenticated through Google
      user = await User.create({
        name: googleName || 'Google User',
        email: googleEmail.toLowerCase(),
        password: undefined,
        isEmailVerified: true, // Google has cryptographically verified this Gmail address
        avatar: googlePicture || '',
        googleId: googleSub || '',
        role: 'user',
      });
    }

    const token = generateToken(user._id, user.role, undefined, user.authVersion || 0);

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: true,
        address: user.address,
        token,
        sellerStatus: user.sellerStatus || 'not_applied',
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    next(error);
  }
};

/**
 * @desc    Toggle product in user's wishlist
 * @route   POST /api/auth/wishlist/:productId
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const index = user.wishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isAdded = false;
    } else {
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      isWishlisted: isAdded,
      wishlist: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's populated wishlist
 * @route   GET /api/auth/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'title price discountPrice images category brand rating numReviews stock',
    });

    res.status(200).json({
      success: true,
      data: user?.wishlist || [],
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (typeof req.body.name === 'string') user.name = req.body.name.trim();
    if (typeof req.body.storeName === 'string') user.storeName = req.body.storeName.trim();
    if (typeof req.body.storeAddress === 'string') user.storeAddress = req.body.storeAddress.trim();
    if (typeof req.body.supportEmail === 'string') user.supportEmail = req.body.supportEmail.trim();
    if (typeof req.body.profilePhoto === 'string') user.profilePhoto = req.body.profilePhoto;
    if (typeof req.body.phone === 'string') {
      user.address = { ...(user.address?.toObject ? user.address.toObject() : user.address), phone: req.body.phone.trim() };
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.address?.phone || '',
        storeName: user.storeName,
        storeAddress: user.storeAddress,
        supportEmail: user.supportEmail,
        profilePhoto: user.profilePhoto,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changeAdminPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword !== (confirmPassword || newPassword)) {
      res.status(400);
      throw new Error('Old password is required and new passwords must match');
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(oldPassword))) {
      res.status(400);
      throw new Error('Old password is incorrect');
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadAdminProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Profile photo file is required');
    }
    const upload = await uploadToCloudinary(
      req.file,
      process.env.CLOUDINARY_ADMIN_FOLDER || 'shopco-admin'
    );
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: upload.secure_url });
    res.status(200).json({ success: true, data: { profilePhoto: upload.secure_url } });
  } catch (error) {
    next(error);
  }
};

const applySeller = async (req, res, next) => {
  try {
    const { name, email, password, storeName, storeDescription, sellerPhone, sellerAddress } = req.body;
    if (!storeName?.trim() || !storeDescription?.trim() || !sellerPhone?.trim() || !sellerAddress?.trim()) {
      res.status(400);
      throw new Error('Store name, description, phone number and address are required');
    }

    let user;
    if (req.user) {
      user = await User.findById(req.user._id).select('+password');
      if (!user) {
        res.status(401);
        throw new Error('Your session is no longer valid');
      }
      if (user.role === 'admin') {
        res.status(403);
        throw new Error('Admin accounts cannot be converted to seller accounts');
      }
    } else {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!name?.trim() || !normalizedEmail || !password) {
        res.status(400);
        throw new Error('Name, email and password are required');
      }
      if (!passwordIsValid(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters and include at least one number');
      }

      user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user) {
        if (user.role === 'admin') {
          res.status(403);
          throw new Error('Admin accounts cannot be converted to seller accounts');
        }
        if (!(await user.matchPassword(password))) {
          res.status(401);
          throw new Error('An account with this email already exists. Use the correct password');
        }
      } else {
        user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: 'seller',
          status: 'active',
          isEmailVerified: true,
        });
      }
    }

    let storeLogo = '';
    if (req.file) {
      const upload = await uploadToCloudinary(
        req.file,
        process.env.CLOUDINARY_SELLER_LOGO_FOLDER || 'shopco-seller-logos'
      );
      storeLogo = upload.secure_url;
    }

    user.name = (typeof name === 'string' && name.trim()) || user.name;
    user.role = 'seller';
    user.storeName = storeName.trim();
    user.storeDescription = storeDescription.trim();
    user.storeLogo = storeLogo || user.storeLogo;
    user.sellerPhone = sellerPhone.trim();
    user.sellerAddress = sellerAddress.trim();
    user.sellerStatus = 'approved';
    await user.save();

    const token = generateToken(user._id, 'seller', undefined, user.authVersion || 0);

    res.status(200).json({
      success: true,
      message: 'Seller setup complete',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'seller',
        isEmailVerified: true,
        sellerStatus: 'approved',
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        storeLogo: user.storeLogo,
        sellerPhone: user.sellerPhone,
        sellerAddress: user.sellerAddress,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name email role isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateAdminUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Role must be user or admin');
    }
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      res.status(400);
      throw new Error('You cannot remove your own admin role');
    }
    if (role === 'admin') {
      const target = await User.findById(req.params.id).select('email');
      if (!target) {
        res.status(404);
        throw new Error('User not found');
      }
      const allowed = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      if (!allowed.includes(target.email.toLowerCase())) {
        res.status(403);
        throw new Error('This email is not allowed to become an admin');
      }
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, ...(role === 'seller' ? { sellerStatus: 'pending' } : {}) },
      { new: true, runValidators: true }
    ).select('name email role isEmailVerified createdAt');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOTP,
  sendLoginOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendVerificationOTP,
  verifyEmailOTP,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  getWishlist,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminProfilePhoto,
  applySeller,
  getAdminUsers,
  updateAdminUserRole,
};
