import  mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  annotations: [{
    x: Number,
    y: Number,
    text: String,
    timestamp: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Annotation', annotationSchema);