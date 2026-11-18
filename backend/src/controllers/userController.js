const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const INDIAN_STATES = new Set([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]);

const validateAddress = (address) => {
  const required = ['fullName', 'phone', 'houseNumber', 'street', 'city', 'state', 'postalCode'];
  for (const field of required) {
    if (!address[field] || !String(address[field]).trim()) return `${field} is required`;
  }
  if (!/^[6-9]\d{9}$/.test(address.phone)) return 'Phone must be a valid 10-digit Indian mobile number';
  if (!/^[1-9]\d{5}$/.test(address.postalCode)) return 'Pincode must be a valid 6-digit Indian PIN code';
  if (!INDIAN_STATES.has(address.state)) return 'Invalid state';
  if (!['Home', 'Work', 'Other'].includes(address.addressType || 'Home')) return 'Invalid address type';
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar || user.profilePhoto || '',
  dob: user.dob || null,
  gender: user.gender || '',
  phone: user.address?.phone || '',
  address: user.address,
  addresses: user.addresses || [],
  storeName: user.storeName || '',
  storeAddress: user.storeAddress || '',
  supportEmail: user.supportEmail || '',
  profilePhoto: user.profilePhoto || '',
});

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: serializeUser(req.user) });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (typeof req.body.name === 'string') {
      if (!req.body.name.trim()) {
        res.status(400);
        throw new Error('Name is required');
      }
      user.name = req.body.name.trim();
    }
    if (typeof req.body.phone === 'string') {
      if (req.body.phone && !/^[6-9]\d{9}$/.test(req.body.phone)) {
        res.status(400);
        throw new Error('Phone must be a valid 10-digit Indian mobile number');
      }
      user.address = { ...(user.address?.toObject ? user.address.toObject() : user.address), phone: req.body.phone };
    }
    if (req.body.dob !== undefined) {
      const dob = req.body.dob ? new Date(req.body.dob) : null;
      if (dob && Number.isNaN(dob.getTime())) {
        res.status(400);
        throw new Error('Invalid date of birth');
      }
      user.dob = dob;
    }
    if (typeof req.body.gender === 'string') {
      if (!['', 'Male', 'Female', 'Other', 'Prefer not to say'].includes(req.body.gender)) {
        res.status(400);
        throw new Error('Invalid gender');
      }
      user.gender = req.body.gender;
    }
    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated', data: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const error = validateAddress(req.body);
    if (error) {
      res.status(400);
      throw new Error(error);
    }
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach((address) => { address.isDefault = false; });
    user.addresses.push({
      ...req.body,
      country: 'India',
      addressType: req.body.addressType || 'Home',
      isDefault: req.body.isDefault || user.addresses.length === 0,
    });
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const error = validateAddress(req.body);
    if (error) {
      res.status(400);
      throw new Error(error);
    }
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    if (req.body.isDefault) user.addresses.forEach((item) => { item.isDefault = false; });
    Object.assign(address, req.body, { country: 'India' });
    if (!user.addresses.some((item) => item.isDefault) && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    user.addresses.forEach((item) => { item.isDefault = item._id.toString() === req.params.addressId; });
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Profile photo is required');
    }
    const upload = await uploadToCloudinary(req.file, 'shopco-users');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: upload.secure_url },
      { new: true }
    );
    res.status(200).json({ success: true, data: { avatar: upload.secure_url }, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: '' }, { new: true });
    res.status(200).json({ success: true, data: { avatar: '' }, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('Old password is required and new passwords must match');
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(oldPassword))) {
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

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  uploadAvatar,
  removeAvatar,
  changePassword,
};
