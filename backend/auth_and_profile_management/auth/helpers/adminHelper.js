const db = require("../models");

// Mendapatkan admin berdasarkan ID
const getAdminById = async (id) => {
  const result = await db.User.findOne({
    where: {
      id,
      role: "admin", // Hanya mencari user dengan role admin
    },
  });
  return result;
};

// Mendapatkan admin berdasarkan user_id
const getAdminByUserId = async (user_id) => {
  const result = await db.User.findOne({
    where: {
      id: user_id,
      role: "admin",
    },
  });
  return result;
};

// Mendapatkan semua admin
const getAllAdmin = async () => {
  const result = await db.User.findAll({
    where: {
      role: "admin", // Hanya mengambil user dengan role admin
    },
  });
  return result;
};

// Membuat admin baru
const createAdmin = async (name, email, password, notelp, alamat) => {
  await db.User.create({
    name,
    email,
    password,
    notelp,
    alamat,
    role: "admin", // Pastikan role yang dibuat adalah admin
  });
};

// Memperbarui informasi admin
const updateAdmin = async (id, name, email, notelp, alamat) => {
  await db.User.update(
    { name, email, notelp, alamat },
    {
      where: {
        id,
        role: "admin",
      },
    }
  );
};

// Menghapus admin berdasarkan ID
const deleteAdmin = async (id) => {
  await db.User.destroy({
    where: {
      id,
      role: "admin",
    },
  });
};

module.exports = {
  getAdminById,
  getAdminByUserId,
  getAllAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
