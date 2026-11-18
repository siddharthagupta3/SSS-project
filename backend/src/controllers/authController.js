const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmailOTP = require('../utils/sendEmail');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

/**
 * Generate a 6-digit numeric OTP
 */
const generate6DigitOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a new customer account & send email OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields (name, email, password)');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    // Generate 6-digit OTP for email verification
    const otp = generate6DigitOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with OTP
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpires,
    });

    // Send OTP via Gmail / Email service
    await sendEmailOTP({ email: user.email, name: user.name, otp });

    if (user) {
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        message: 'Account created! Verification OTP sent to your Gmail.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          address: user.address,
          token,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.role === 'admin') {
        res.status(401);
        throw new Error('Invalid credentials');
      }
      const token = generateToken(user._id, user.role);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified || false,
          address: user.address,
          token,
          redirectTo: user.role === 'admin' ? '/admin' : null,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
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
    const email = req.body.email || req.user?.email;

    if (!email) {
      res.status(400);
      throw new Error('Email address is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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

    const otp = generate6DigitOTP();
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmailOTP({ email: user.email, name: user.name, otp });

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

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and 6-digit OTP code are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationOTP +emailVerificationExpires');

    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified',
        data: { isEmailVerified: true },
      });
    }

    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp.trim()) {
      res.status(400);
      throw new Error('Invalid verification code entered');
    }

    if (new Date() > user.emailVerificationExpires) {
      res.status(400);
      throw new Error('Verification code has expired. Please request a new one.');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Gmail address verified successfully! 🎉',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: true,
      },
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
    const user = await User.findById(req.user._id).select('+password');

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
      if (req.body.password.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
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
    const token = generateToken(updatedUser._id, updatedUser.role);

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
    } catch {
      res.status(401);
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
        password: `G_${Date.now()}_${Math.random().toString(36).substring(7)}!`,
        isEmailVerified: true, // Google has cryptographically verified this Gmail address
        avatar: googlePicture || '',
        googleId: googleSub || '',
        role: 'user',
      });
    }

    const token = generateToken(user._id, user.role);

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
    const upload = await uploadToCloudinary(req.file, 'shopco-admin');
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: upload.secure_url });
    res.status(200).json({ success: true, data: { profilePhoto: upload.secure_url } });
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
    if (!['user', 'admin'].includes(role)) {
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
      { role },
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
  getAdminUsers,
  updateAdminUserRole,
};
