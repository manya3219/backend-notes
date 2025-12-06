import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const fileSchema = new Schema({
    filename: {type:String,required: true},
    path: {type:String, required: true},
    size: {type:Number, required: true},
    uuid: {type:String, required: true},
    title: {type:String,required: true},
    folder: {type:String, default: null},
    
    // Store file data directly in MongoDB as Base64
    fileData: {type: String}, // Base64 encoded file
    mimeType: {type: String}, // e.g., 'application/pdf', 'image/jpeg'
    
    // Legacy field for old files
    image:{
        type:String,
        default:"https://i.pinimg.com/736x/e0/1f/be/e01fbe4ca73cda13bdd58b321e3a3b77.jpg",
    },
   
},{timestamps:true}, );


const File = mongoose.model('File',fileSchema);


export default File;


