import mongoose, { Schema, model, models } from 'mongoose';

const NoteSchema = new Schema({
  title: { type: String,
           required: true },
  content: { type: String,
                 required: true },
  // This will store the "AI meaning" of the text later
  embedding: { type: [Number], 
               default: [] }, 
}, { timestamps: true });

// In Next.js, we check if the model exists already to prevent re-compilation errors
export const Note = models.Note || model('Note', NoteSchema);