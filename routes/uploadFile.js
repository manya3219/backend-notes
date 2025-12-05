import express from 'express';
const router = express.Router();
import File from '../models/file.js';
import { v4 as uuid4 } from 'uuid';
import { upload } from '../config/cloudinary.js';

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

export default router;