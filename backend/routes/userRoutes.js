import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  getUsersBySearchQuery,
} from '../controllers/userController.js';
import isLogin from '../middlewares/isLogin.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/search", isLogin, getUsersBySearchQuery);

// router.get('/', getAllUsers);
// router.get('/:id', getUserById);
// router.put('/:id', updateUser);

export default router;
