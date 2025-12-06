import express from 'express';
const router = express.Router();
import File from '../models/file.js';
import { v4 as uuid4 } from 'uuid';
import { upload } from '../config/cloudinary.js';
import multer from 'multer';

// Memory storage for Google Drive uploads
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// Cloudinary upload (default)
router.post('/', upload.single('myfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Cloudinary upload result:', req.file);

    // Create file document with Cloudinary URL
    const file = new File({
      filename: req.file.originalname,
      title: req.body.title,
      folder: req.body.folder || null,
      uuid: uuid4(),
      path: req.file.path, // Cloudinary URL
      image: req.file.path, // Cloudinary URL for viewing
      size: req.file.size || 0,
      storageType: 'cloudinary', // Track storage type
    });

    const response = await file.save();
    
    res.json({
      success: true,
      file: response,
      message: 'File uploaded successfully to Cloudinary',
      url: req.file.path
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      error: 'Error uploading file',
      details: err.message 
    });
  }
});

// Google Drive upload (alternative endpoint)
router.post('/gdrive', memoryUpload.single('myfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Google Drive is configured
    if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
      return res.status(503).json({ 
        error: 'Google Drive not configured. Using Cloudinary instead.',
        useCloudinary: true 
      });
    }

    const { uploadToGoogleDrive } = await import('../config/googleDrive.js');
    
    console.log('Uploading to Google Drive:', req.file.originalname);

    // Upload to Google Drive
    const driveResult = await uploadToGoogleDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Create file document with Google Drive links
    const file = new File({
      filename: req.file.originalname,
      title: req.body.title,
      folder: req.body.folder || null,
      uuid: uuid4(),
      path: driveResult.embedLink, // Google Drive embed link
      image: driveResult.embedLink, // For viewing
      size: req.file.size || 0,
      storageType: 'googledrive', // Track storage type
      driveFileId: driveResult.fileId, // Store Drive file ID for deletion
    });

    const response = await file.save();
    
    res.json({
      success: true,
      file: response,
      message: 'File uploaded successfully to Google Drive',
      url: driveResult.embedLink,
      viewLink: driveResult.viewLink,
    });
  } catch (err) {
    console.error('Google Drive upload error:', err);
    res.status(500).json({ 
      error: 'Error uploading to Google Drive',
      details: err.message 
    });
  }
});

export default router;