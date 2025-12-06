import express from 'express';
const router = express.Router();
import File from '../models/file.js';
import { v4 as uuid4 } from 'uuid';
import multer from 'multer';

// Memory storage - store file in memory as buffer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 16 * 1024 * 1024 } // 16MB limit (MongoDB limit is 16MB)
});

// Upload file - Store directly in MongoDB
router.post('/', upload.single('myfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file to MongoDB:', req.file.originalname);
    console.log('File size:', req.file.size, 'bytes');

    // Convert file buffer to Base64
    const fileBase64 = req.file.buffer.toString('base64');

    // Create file document with Base64 data
    const file = new File({
      filename: req.file.originalname,
      title: req.body.title,
      folder: req.body.folder || null,
      uuid: uuid4(),
      path: `/api/file/view/${uuid4()}`, // Virtual path
      size: req.file.size,
      fileData: fileBase64, // Store Base64 encoded file
      mimeType: req.file.mimetype, // Store MIME type
    });

    const response = await file.save();
    
    console.log('File saved to MongoDB successfully!');
    
    res.json({
      success: true,
      file: response,
      message: 'File uploaded successfully to MongoDB',
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