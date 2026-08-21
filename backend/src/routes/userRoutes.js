const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createUserSchema, updateUserSchema } = require('../validations/authValidation');

const router = express.Router();

// All user management routes require KEPALA_BENGKEL role
router.use(authMiddleware);
router.use(roleMiddleware('KEPALA_BENGKEL'));

router.get('/', userController.getAllUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
