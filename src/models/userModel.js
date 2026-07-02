const bcrypt = require('bcryptjs');
const db = require('../config/database');

const findByUsernameStmt = db.prepare('SELECT * FROM users WHERE username = ?');
const findByIdStmt = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?');
const findByIdFullStmt = db.prepare('SELECT * FROM users WHERE id = ?');
const listStaffStmt = db.prepare(`
  SELECT id, username, role, created_at
  FROM users
  WHERE role IN ('catter', 'kasir')
  ORDER BY role ASC, username ASC
`);
const countByRoleStmt = db.prepare('SELECT COUNT(*) AS total FROM users WHERE role = ?');
const createUserStmt = db.prepare(`
  INSERT INTO users (username, password, role)
  VALUES (?, ?, ?)
`);
const updateUserWithPasswordStmt = db.prepare(`
  UPDATE users
  SET username = ?, password = ?, role = ?
  WHERE id = ?
`);
const updateUserWithoutPasswordStmt = db.prepare(`
  UPDATE users
  SET username = ?, role = ?
  WHERE id = ?
`);
const updatePasswordStmt = db.prepare(`
  UPDATE users
  SET password = ?
  WHERE id = ?
`);
const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?');

function findByUsername(username) {
  return findByUsernameStmt.get(username);
}

function findById(id) {
  return findByIdStmt.get(id);
}

function findByIdFull(id) {
  return findByIdFullStmt.get(id);
}

function listStaff() {
  return listStaffStmt.all();
}

function countByRole(role) {
  const result = countByRoleStmt.get(role);
  return result.total;
}

function createUser({ username, password, role }) {
  const result = createUserStmt.run(username, bcrypt.hashSync(password, 10), role);
  return result.lastInsertRowid;
}

function upsertPelangganLogin({ userId, username, password }) {
  if (!username) {
    return userId || null;
  }

  if (!userId) {
    return createUser({ username, password, role: 'pelanggan' });
  }

  if (password) {
    updateUserWithPasswordStmt.run(username, bcrypt.hashSync(password, 10), 'pelanggan', userId);
  } else {
    updateUserWithoutPasswordStmt.run(username, 'pelanggan', userId);
  }

  return userId;
}

function deleteById(id) {
  return deleteUserStmt.run(id);
}

function updateUser({ id, username, password, role }) {
  if (password) {
    return updateUserWithPasswordStmt.run(username, bcrypt.hashSync(password, 10), role, id);
  }

  return updateUserWithoutPasswordStmt.run(username, role, id);
}

function updatePassword(id, password) {
  return updatePasswordStmt.run(bcrypt.hashSync(password, 10), id);
}

module.exports = {
  findByUsername,
  findById,
  findByIdFull,
  listStaff,
  countByRole,
  createUser,
  updateUser,
  updatePassword,
  upsertPelangganLogin,
  deleteById
};
