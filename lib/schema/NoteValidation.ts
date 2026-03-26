import { z } from "zod";

export const NoteValidation = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    embedding: z.array(z.number()).default([]),
});

export type NoteInput = z.infer<typeof NoteValidation>;