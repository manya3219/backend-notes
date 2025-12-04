import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({ 
  url: String,
  title: String,
  description: String
});

const playlistSchema = new mongoose.Schema({
  name: String,
  folder: { type: String, default: null },
  description: String,
  videos: [videoSchema],
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
