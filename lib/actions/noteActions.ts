// 1. THIS IS THE MOST IMPORTANT LINE. 
// It guarantees this code never ships to the browser (protecting your database).
"use server";

// 2. Import everything you built in the previous steps
import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/schema/Note";
import { NoteValidation } from "@/lib/schema/NoteValidation";

// Optional: Next.js gives us a handy tool to refresh the page automatically after adding data
import { revalidatePath } from "next/cache";



export async function createNoteAction(formData: FormData) {
    // 3. Extract the raw data from the frontend form
    const rawData = {
        title: formData.get("title")?.toString(),
        content: formData.get("content")?.toString(),
    };

    // 4. Validate securely with Zod (Phase 3 in action!)
    const validatedData = NoteValidation.safeParse(rawData);

    if (!validatedData.success) {
        console.log("Validation Failed:", validatedData.error.flatten());
        return { success: false, error: "Invalid data submitted" };
    }

    try {
        // 5. Connect to MongoDB (Phase 2 in action!)
        await connectToDatabase();

        // 6. THIS IS THE MAGIC AI STEP! We use a direct REST call because the new SDK has a 404 bug for embeddings!
        const combinedText = `Title: ${validatedData.data.title}\nBody: ${validatedData.data.content}`;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
        const aiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text: combinedText }] }
            })
        });
        
        const data = await aiResponse.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return { success: false, error: "Failed to generate AI embedding." };
        }

        // Extract the array of numbers representing your text
        const vectorValues = data.embedding.values;

        // 7. Save the Note AND the Vector into MongoDB together!
        const newNote = await Note.create({
            title: validatedData.data.title,
            content: validatedData.data.content,
            embedding: vectorValues, // <--- We mapped this into your Mongoose Schema earlier!
        });

        // 7. Tell Next.js to refresh the homepage so the new note shows up instantly!
        revalidatePath("/");

        return { success: true, message: "Note created successfully!" };

    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to create note." };
    }
}

export async function searchNotesAction(query: string) {
    if (!query) return [];

    try {
        await connectToDatabase();

        // 1. Convert user's search query into an embedding vector
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
        const aiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text: query }] }
            })
        });
        
        const data = await aiResponse.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return [];
        }

        const queryVector = data.embedding.values;

        // 2. Perform Vector Search using MongoDB Aggregate
        const notes = await Note.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index_1", 
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 100, 
                    limit: 10 
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    score: { $meta: "vectorSearchScore" } // Includes AI confidence match
                }
            }
        ]);

        return JSON.parse(JSON.stringify(notes));
    } catch (error) {
        console.error("Search Error:", error);
        return [];
    }
}
