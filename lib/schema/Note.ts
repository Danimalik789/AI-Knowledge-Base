import mongoose, { Schema, model, models } from 'mongoose';

const NoteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], default: [] }, 
}, { timestamps: true });

export const Note = models.Note || model('Note', NoteSchema);