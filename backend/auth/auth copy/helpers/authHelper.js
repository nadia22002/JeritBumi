const Boom = require("boom");
const argon2 = require("argon2");
const crypto = require("crypto");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const db = require("../models");
const GeneralHelper = require("./generalHelper");
const AdminHelper = require("./adminHelper");
const UserHelper = require("./userHelper");
const EmailHelper = require("./emailHelper");

const jwtSecretToken = "super_strong_key";
const jwtExpiresIn = "24h";

const __hashPassword = async (password) => {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id, // Menggunakan Argon2id untuk keamanan lebih baik
    memoryCost: 2 ** 16, // Biaya memori (64 MiB)
    timeCost: 3, // Jumlah iterasi
    parallelism: 1, // Jumlah thread paralel
  });
  return hash;
};

const __comparePassword = async (payloadPass, dbPass) => {
  const isMatch = await argon2.verify(dbPass, payloadPass);
  if (isMatch) return true;
  return false;
};

const __generateToken = (data) => {
  return jwt.sign(data, jwtSecretToken, { expiresIn: jwtExpiresIn });
};

const verifyEmail = async (token) => {
  try {
    console.log("Token diterima:", token); // Tambahkan log

    const user = await db.User.findOne({ where: { verificationToken: token } });

    if (!user) {
      console.error("Token tidak valid atau pengguna tidak ditemukan.");
      throw Boom.badRequest("INVALID_TOKEN");
    }

    // Update status pengguna menjadi terverifikasi
    await db.User.update(
      { isVerified: true, verificationToken: null },
      { where: { id: user.id } }
    );

    return { message: "Email berhasil diverifikasi. Silakan login." };
  } catch (err) {
    console.error("Error saat verifikasi email:", err); // Menampilkan error di console
    throw GeneralHelper.errorResponse(err);
  }
};

const registerUser = async (dataObject) => {
  let { name, email, password, notelp, alamat, role } = dataObject;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (user) {
      throw Boom.badRequest("EMAIL_HAS_BEEN_USED");
    }

    const roleMapping = { 1: "user", 2: "admin" };
    role = roleMapping[role] || role;

    if (!["user", "admin"].includes(role)) {
      throw Boom.badRequest("INVALID_ROLE");
    }

    const hashedPass = await __hashPassword(password);

    // Buat token verifikasi
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await db.User.create({
      name,
      email,
      password: hashedPass,
      notelp,
      alamat,
      role,
      isVerified: false, // User belum diverifikasi
      verificationToken, // Simpan token di database
    });

    const verificationLink = `https://authjeritbumi-production-ae42.up.railway.app/auth/verify-email/${verificationToken}`;

    // Kirim email verifikasi
    const emailSent = await EmailHelper.sendEmail(
      email,
      "Verifikasi Akun",
      `Halo ${name},\n\nSilakan klik link berikut untuk mengaktifkan akun Anda:\n${verificationLink}\n\nJika Anda tidak mendaftar, abaikan email ini.\n\n Terima Kasih`
    );

    if (!emailSent) {
      console.log("Gagal mengirim email verifikasi.");
    }

    return true;
  } catch (err) {
    console.error(err);
    throw GeneralHelper.errorResponse(err);
  }
};

const login = async (dataObject) => {
  const { email, password } = dataObject;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return Promise.reject(Boom.notFound("USER_NOT_FOUND"));
    }

    if (!user.isVerified) {
      return Promise.reject(Boom.badRequest("EMAIL_NOT_VERIFIED"));
    }

    const isPassMatched = await __comparePassword(password, user.password);
    if (!isPassMatched) {
      return Promise.reject(Boom.badRequest("WRONG_CREDENTIALS"));
    }

    const token = __generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return Promise.resolve({ token });
  } catch (err) {
    console.log(err);
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
};

const changePassword = async (email, oldPassword, newPassword) => {
  try {
    const user = await db.User.findOne({
      where: {
        email,
      },
    });

    const isPassMatched = await __comparePassword(oldPassword, user.password);
    if (!isPassMatched) {
      return Promise.reject(Boom.badRequest("WRONG_CREDENTIALS"));
    }

    const hashedNewPassword = await __hashPassword(newPassword);

await db.User.update(
  { password: hashedNewPassword },
  {
    where: { email },
  }
);

    return Promise.resolve({ message: "Successfully change password" });
  } catch (err) {
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
};

const getUrlForgotPassword = async (email) => {
  const user = await UserHelper.getUserByEmail(email);
  if (_.isEmpty(user)) {
    return Promise.reject(Boom.notFound("ACCOUNT_NOT_FOUND"));
  }

  const currentTime = new Date();
  const expiresIn = currentTime.setMinutes(currentTime.getMinutes() + 30); // 30 menit masa berlaku token
  const token = uuidv4();

  const tokenExist = await db.ForgotPassword.findOne({
    where: {
      user_id: user.id,
    },
  });

  if (_.isEmpty(tokenExist)) {
    await db.ForgotPassword.create({
      token,
      expiresIn,
      user_id: user.id,
    });
  } else {
    await db.ForgotPassword.update(
      { token, expiresIn },
      {
        where: {
          user_id: user.id,
        },
      }
    );
  }

  const resetUrl = `https://authjeritbumi-production-ae42.up.railway.app/forgot-password/change/${token}`;

  // Kirim email
  const emailSent = await EmailHelper.sendEmail(
    email,
    "Reset Password",
    `Halo ${user.name},\n\nSilakan klik link berikut untuk mereset password Anda:\n${resetUrl}\n\nLink ini berlaku selama 30 menit.\n\nJika Anda tidak meminta reset password, abaikan email ini.\n\nTerima kasih.`
  );

  if (!emailSent) {
    console.log("Gagal mengirim email reset password.");
  }

  return Promise.resolve({
    message: "Reset password link has been sent to your email.",
  });
};


const changeForgotPassword = async (token, newPassword) => {
  const forgotPassword = await db.ForgotPassword.findOne({
    where: {
      token,
    },
  });
  if (_.isEmpty(forgotPassword)) {
    return Promise.reject(Boom.notFound("TOKEN_NOT_VALID"));
  }

  const currentTime = new Date();
  const expireTime = new Date(forgotPassword.expiresIn);
  console.log(currentTime, expireTime);
  if (currentTime > expireTime) {
    return Promise.reject(Boom.badRequest("TOKEN_EXPIRED"));
  }

  const hashedNewPassword = await __hashPassword(newPassword);

  await db.User.update(
    { password: hashedNewPassword },
    {
      where: {
        id: forgotPassword.user_id,
      },
    }
  );

  await db.ForgotPassword.destroy({
    where: {
      id: forgotPassword.id,
    },
  });

  return Promise.resolve({
    message: "Change password successful",
  });
};

const getProfile = async (email) => {
  const result = await db.User.findOne({
    where: {
      email,
    },
  });

  return Promise.resolve(result);
};

module.exports = {
  registerUser,
  login,
  getProfile,
  changePassword,
  getUrlForgotPassword,
  changeForgotPassword,
  verifyEmail,
};
