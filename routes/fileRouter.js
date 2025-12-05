// routes/fileRouter.js
import express from 'express';
import File from '../models/file.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
import { verifyToken } from '../utils/verifyUser.js';

// Get all files
router.get('/', async (req, res) => {
  try {
    console.log(req.body);
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View file (for download page)
router.get("/:uuid", async (req,res) =>{
 
  console.log(req.params.uuid);
 
  try{
   const file=await File.findOne({uuid: req.params.uuid});
   if(!file){
       return res.render('download',{error:'link is expired'});
   }
   console.log(`${process.env.APP_BASE_URL}/file/download/${file.uuid}`);
   return res.render('download',{
    _id:file.id,
    uuid:file.uuid,
    fileName:file.filename,
    
    fileSize:file.size,
    downloadLink:`${process.env.APP_BASE_URL}/file/download/${file.uuid}`
});

  }catch(err){
      return res.render('download',{error:'something went wrong.'});
  }
});

// View file inline (display in browser)
router.get("/view/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // If file is on Cloudinary, redirect to Cloudinary URL with proper headers
    if (file.image && file.image.includes('cloudinary')) {
      // Just redirect to Cloudinary URL - browser will handle it
      return res.redirect(file.image);
    }
    
    // For local files
    const filePath = path.join(__dirname, '..', file.path);
    
    // Set content type based on file extension
    const ext = path.extname(file.filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.txt': 'text/plain'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error viewing file' });
  }
});

// Delete a single file
router.delete("/delete/:uuid", verifyToken, async (req, res) => {
  try {
    console.log('Delete request for UUID:', req.params.uuid);
    console.log('User:', req.user);
    
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      console.log('File not found');
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('File found:', file.title);

    // If file is on Cloudinary, delete from there too
    if (file.image && file.image.includes('cloudinary')) {
      try {
        const { cloudinary } = await import('../config/cloudinary.js');
        // Extract public_id from Cloudinary URL
        const urlParts = file.image.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `nexahub-files/${publicIdWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        console.log('File deleted from Cloudinary');
      } catch (cloudinaryErr) {
        console.error('Cloudinary delete error:', cloudinaryErr);
        // Continue even if Cloudinary delete fails
      }
    }

    // Delete file from database
    await File.deleteOne({ uuid: req.params.uuid });
    
    console.log('File deleted from database');
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Error deleting file', details: err.message });
  }
});

// Delete entire folder (all files in a folder)
router.delete("/delete-folder/:folderName", verifyToken, async (req, res) => {
  try {
    const folderName = decodeURIComponent(req.params.folderName);
    console.log('Delete folder request for:', folderName);
    console.log('User:', req.user);
    
    // Find all files in this folder and subfolders
    const files = await File.find({ 
      $or: [
        { folder: folderName },
        { folder: { $regex: `^${folderName}/` } }
      ]
    });
    
    if (files.length === 0) {
      console.log('Folder not found or empty');
      return res.status(404).json({ error: 'Folder not found or empty' });
    }

    console.log(`Found ${files.length} files to delete`);

    // Delete all files in the folder and subfolders from database
    await File.deleteMany({ 
      $or: [
        { folder: folderName },
        { folder: { $regex: `^${folderName}/` } }
      ]
    });
    
    console.log('Folder deleted successfully');
    res.status(200).json({ 
      message: 'Folder deleted successfully',
      deletedCount: files.length 
    });
  } catch (err) {
    console.error('Delete folder error:', err);
    res.status(500).json({ error: 'Error deleting folder', details: err.message });
  }
});




export default router;
