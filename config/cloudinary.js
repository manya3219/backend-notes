import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    const isImage = file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    
    return {
      folder: 'nexahub-files',
      resource_type: resourceType, // 'raw' for PDFs/docs, 'image' for images
      access_mode: 'public',
      allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'ppt', 'pptx'],
    };
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

export { cloudinary, upload };
