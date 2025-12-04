import express from 'express';
import { signup, login, google, adminSignup } from '../controllers/auth.controller.js';


const router=express.Router();

router.post("/signup",signup);
router.post("/admin-signup",adminSignup);
router.post("/login",login);
router.post("/google",google);

export default router;