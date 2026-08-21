const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    status: 'success',
    data: users,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Akun pengguna berhasil dibuat.',
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Data pengguna berhasil diperbarui.',
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const result = await userService.toggleUserStatus(req.params.id, req.user.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
    data: result,
  });
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
