import mongoose from 'mongoose';


// schema
const annotationSchema = new mongoose.Schema({
  text: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  arrowStart: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  arrowEnd: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }
});

// videoschema
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalVideoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },  //added
  annotations: [annotationSchema],//added
  isAnnotated: { type: Boolean, default: false },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  privacy: { type: String, enum: ['public', 'private'], required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default  mongoose.model('Video', videoSchema);
