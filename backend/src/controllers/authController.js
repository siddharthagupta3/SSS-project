const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmailOTP = require('../utils/sendEmail');

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
          // Provided in response for easy testing in local dev environment
          devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
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
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
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

module.exports = {
  registerUser,
  loginUser,
  sendVerificationOTP,
  verifyEmailOTP,
  getUserProfile,
  updateUserProfile,
};
