import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
export const verifyToken = (req, res, next) => {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies.access_token;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  console.log('Token found:', token ? 'Yes' : 'No');
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  if (!token) {
    return next(errorHandler(401, 'Unauthorized - No token provided'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err.message);
      return next(errorHandler(401, 'Unauthorized - Invalid token'));
    }
    req.user = user;
    console.log('User verified:', user.id);
    next();
  });
};