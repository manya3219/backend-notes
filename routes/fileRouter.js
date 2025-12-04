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
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from database
    await File.deleteOne({ uuid: req.params.uuid });
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

// Delete entire folder (all files in a folder)
router.delete("/delete-folder/:folderName", verifyToken, async (req, res) => {
  try {
    const folderName = req.params.folderName;
    
    // Find all files in this folder
    const files = await File.find({ folder: folderName });
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'Folder not found or empty' });
    }

    // Delete all files in the folder from database
    await File.deleteMany({ folder: folderName });
    
    res.status(200).json({ 
      message: 'Folder deleted successfully',
      deletedCount: files.length 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting folder' });
  }
});




export default router;
