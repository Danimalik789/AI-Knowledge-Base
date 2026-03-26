import { createNoteAction } from "@/lib/actions/noteActions";
import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/schema/Note";

export default async function Home() {
  // 1. Fetch data directly from MongoDB! No APIs needed.
  await connectToDatabase();
  const rawNotes = await Note.find().sort({ createdAt: -1 }); // newest first
  const notes = JSON.parse(JSON.stringify(rawNotes)); // cleans up Mongoose data for React

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Knowledge Base</h1>
      
      {/* --- FORM SECTION --- */}
      <form action={createNoteAction} className="space-y-4 bg-gray-50 p-6 rounded-lg dark:bg-gray-800 border dark:border-gray-700">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">Note Title</label>
          <input 
            type="text" name="title" id="title" required
            className="w-full border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600"
            placeholder="e.g., How to use Next.js Server Actions" 
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
          <textarea 
            name="content" id="content" rows={4} required
            className="w-full border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600"
            placeholder="Write your note down here..." 
          />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Save Note
        </button>
      </form>

      {/* --- DISPLAY NOTES SECTION --- */}
      <div className="mt-12 space-y-4 bg-gray-50/50 p-6 rounded-lg border dark:bg-gray-800/50 dark:border-gray-700">
        <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-700">Your Knowledge Base</h2>
        
        {notes.length === 0 ? (
          <p className="text-gray-500 italic">No notes yet. Add your first one above!</p>
        ) : (
          notes.map((note: any) => (
            <div key={note._id} className="bg-white dark:bg-gray-900 p-4 rounded shadow border dark:border-gray-700 transition hover:shadow-md">
              <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{note.title}</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{note.content}</p>
              <span className="text-xs text-gray-400 mt-4 block">
                Saved on: {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

    </main>
  );
}
