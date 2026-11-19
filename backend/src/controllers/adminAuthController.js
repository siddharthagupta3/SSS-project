const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmailOTP = require('../utils/sendEmail');

const genericError = (res) => {
  res.status(401);
  throw new Error('Invalid credentials');
};

const isAdminEmail = (email) =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

const encryptSecret = (secret) => {
  const key = crypto.createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY || '').digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

const decryptSecret = (value) => {
  const [ivHex, tagHex, encryptedHex] = String(value).split(':');
  if (!ivHex || !tagHex || !encryptedHex) throw new Error('Invalid authenticator configuration');
  const key = crypto.createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY || '').digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
};

const lockCheck = (user) => {
  if (user.adminLockUntil && user.adminLockUntil > new Date()) {
    return true;
  }
};

const getChallengeUser = async (challengeId) =>
  User.findOne({ adminChallengeId: challengeId }).select('+password +totpSecret +backupCodes +adminChallengeId +adminOtpHash +adminOtpExpires +adminOtpAttempts +adminOtpLastSent +adminTotpAttempts +adminLockUntil');

const adminLoginStepOne = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return genericError(res);

    const user = await User.findOne({ email }).select('+password +totpSecret +backupCodes +adminChallengeId +adminOtpHash +adminOtpExpires +adminOtpAttempts +adminOtpLastSent +adminTotpAttempts +adminPasswordAttempts +adminLockUntil');
    if (!user || user.role !== 'admin' || !isAdminEmail(email) || lockCheck(user)) return genericError(res);
    if (!(await user.matchPassword(password))) {
      user.adminPasswordAttempts = (user.adminPasswordAttempts || 0) + 1;
      if (user.adminPasswordAttempts >= 5) user.adminLockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return genericError(res);
    }
    user.adminPasswordAttempts = 0;

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const challengeId = crypto.randomBytes(24).toString('hex');
    user.adminChallengeId = challengeId;
    user.adminOtpHash = otpHash;
    user.adminOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.adminOtpAttempts = 0;
    user.adminOtpLastSent = new Date();
    user.adminTotpAttempts = 0;
    await user.save();

    await sendEmailOTP({ email: user.email, name: user.name, otp });

    res.status(200).json({
      success: true,
      data: {
        challengeId,
        otpExpiresIn: 300,
        requiresTotpSetup: !user.totpEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendAdminEmailOtp = async (req, res, next) => {
  try {
    const { challengeId } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user)) return genericError(res);
    if (user.adminOtpLastSent && Date.now() - user.adminOtpLastSent.getTime() < 30 * 1000) {
      res.status(429);
      throw new Error('Invalid credentials');
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.adminOtpHash = await bcrypt.hash(otp, 10);
    user.adminOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.adminOtpAttempts = 0;
    user.adminOtpLastSent = new Date();
    await user.save();
    await sendEmailOTP({ email: user.email, name: user.name, otp });
    res.status(200).json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    next(error);
  }
};

const verifyAdminEmailOtp = async (req, res, next) => {
  try {
    const { challengeId, otp } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user) || !/^\d{6}$/.test(String(otp || ''))) return genericError(res);
    if (!user.adminOtpHash || !user.adminOtpExpires || user.adminOtpExpires < new Date()) return genericError(res);

    const valid = await bcrypt.compare(String(otp), user.adminOtpHash);
    if (!valid) {
      user.adminOtpAttempts = (user.adminOtpAttempts || 0) + 1;
      if (user.adminOtpAttempts >= 3) {
        user.adminLockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return genericError(res);
    }

    user.adminOtpHash = undefined;
    user.adminOtpExpires = undefined;
    user.adminOtpAttempts = 0;
    await user.save();
    res.status(200).json({
      success: true,
      data: {
        emailVerified: true,
        requiresTotpSetup: !user.totpEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

const setupAdminTotp = async (req, res, next) => {
  try {
    const { challengeId } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user)) return genericError(res);
    if (!process.env.TOTP_ENCRYPTION_KEY || process.env.TOTP_ENCRYPTION_KEY.length !== 32) {
      res.status(500);
      throw new Error('Authenticator setup is unavailable');
    }

    const secret = speakeasy.generateSecret({ name: `SHOP.CO:${user.email}`, length: 20 });
    user.totpSecret = encryptSecret(secret.base32);
    await user.save();
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    res.status(200).json({
      success: true,
      data: {
        qrCode,
        manualKey: secret.base32,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyAdminTotpSetup = async (req, res, next) => {
  try {
    const { challengeId, code } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user) || !user.totpSecret) return genericError(res);

    const valid = speakeasy.totp.verify({
      secret: decryptSecret(user.totpSecret),
      encoding: 'base32',
      token: String(code || ''),
      window: 1,
    });
    if (!valid) {
      user.adminTotpAttempts = (user.adminTotpAttempts || 0) + 1;
      if (user.adminTotpAttempts >= 3) user.adminLockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return genericError(res);
    }

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
    user.backupCodes = await Promise.all(backupCodes.map(async (code) => ({
      codeHash: await bcrypt.hash(code, 10),
      used: false,
    })));
    user.totpEnabled = true;
    user.adminTotpAttempts = 0;
    await user.save();

    const token = generateToken(user._id, 'admin', '12h', user.authVersion || 0);
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo: '/admin',
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyAdminTotp = async (req, res, next) => {
  try {
    const { challengeId, code } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user) || !user.totpSecret || !user.totpEnabled) return genericError(res);

    let valid = speakeasy.totp.verify({
      secret: decryptSecret(user.totpSecret),
      encoding: 'base32',
      token: String(code || ''),
      window: 1,
    });

    if (!valid && /^[A-F0-9]{8}$/i.test(String(code || '').trim())) {
      for (const backup of user.backupCodes || []) {
        if (!backup.used && await bcrypt.compare(String(code).trim().toUpperCase(), backup.codeHash)) {
          backup.used = true;
          valid = true;
          break;
        }
      }
    }

    if (!valid) {
      user.adminTotpAttempts = (user.adminTotpAttempts || 0) + 1;
      if (user.adminTotpAttempts >= 3) user.adminLockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return genericError(res);
    }

    user.adminTotpAttempts = 0;
    user.adminChallengeId = undefined;
    await user.save();
    const token = generateToken(user._id, 'admin', '12h', user.authVersion || 0);
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo: '/admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

const resetAdminTotpRequest = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password +adminChallengeId +adminOtpHash +adminOtpExpires +adminOtpAttempts +adminOtpLastSent');
    if (!user || lockCheck(user) || !(await user.matchPassword(String(password || '')))) return genericError(res);

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.adminChallengeId = crypto.randomBytes(24).toString('hex');
    user.adminOtpHash = await bcrypt.hash(otp, 10);
    user.adminOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.adminOtpAttempts = 0;
    user.adminOtpLastSent = new Date();
    await user.save();
    await sendEmailOTP({ email: user.email, name: user.name, otp });
    res.status(200).json({ success: true, data: { challengeId: user.adminChallengeId } });
  } catch (error) {
    next(error);
  }
};

const resetAdminTotpVerify = async (req, res, next) => {
  try {
    const { challengeId, otp } = req.body;
    const user = await getChallengeUser(challengeId);
    if (!user || lockCheck(user) || !user.adminOtpHash || user.adminOtpExpires < new Date()) return genericError(res);
    if (!await bcrypt.compare(String(otp || ''), user.adminOtpHash)) {
      user.adminOtpAttempts = (user.adminOtpAttempts || 0) + 1;
      if (user.adminOtpAttempts >= 3) user.adminLockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return genericError(res);
    }

    user.totpSecret = undefined;
    user.totpEnabled = false;
    user.backupCodes = [];
    user.adminOtpHash = undefined;
    user.adminOtpExpires = undefined;
    user.adminOtpAttempts = 0;
    await user.save();
    res.status(200).json({ success: true, message: 'Authenticator reset. Setup it again.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLoginStepOne,
  resendAdminEmailOtp,
  verifyAdminEmailOtp,
  setupAdminTotp,
  verifyAdminTotpSetup,
  verifyAdminTotp,
  resetAdminTotpRequest,
  resetAdminTotpVerify,
};
