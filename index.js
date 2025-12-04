import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


import userRoutes from'./routes/user.route.js';
import authRoutes from'./routes/auth.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import postRoutes from'./routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import UploadFile from './routes/uploadFile.js';
import DownloadFile from './routes/downloadFile.js';
import fileRouter from './routes/fileRouter.js';
import playlists from './routes/playlists.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log('mongodb is connected');
})
.catch((err)=>{
    console.log(err);
})
const app=express();
import cors from 'cors';
app.use(express.static('public'));
//template engines
app.set("views",path.join(__dirname,"/views"));
app.set('view engine' , 'ejs');

// CORS configuration for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-notes-2-ija5.onrender.com',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.listen(5000,()=>{
    console.log('Server is running on port 5000 ');
});

// Routes
app.use('/api/playlists', playlists);

app.use('/api/user',userRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/post',postRoutes);
app.use('/api/comment',commentRoutes);
app.use('/api/files',UploadFile);
app.use('/file/download',DownloadFile);
app.use('/api/file', fileRouter);
app.get ("/" ,async(req,res)=>{
    res.send("success");
})





app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
});