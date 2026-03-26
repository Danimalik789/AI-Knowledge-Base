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

        // 6. Insert into database using your Mongoose Model
        const newNote = await Note.create({
            title: validatedData.data.title,
            content: validatedData.data.content,
        });

        // 7. Tell Next.js to refresh the homepage so the new note shows up instantly!
        revalidatePath("/");
        
        return { success: true, message: "Note created successfully!" };
        
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to create note." };
    }
}
