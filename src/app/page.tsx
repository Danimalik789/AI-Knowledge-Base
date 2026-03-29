import { createNoteAction, searchNotesAction } from "@/lib/actions/noteActions";
import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/schema/Note";
import Link from "next/link";

export default async function Home(props: { searchParams?: Promise<{ q?: string }> }) {
  await connectToDatabase();
  
  // Awaiting searchParams correctly handles Next.js 15 async promise types
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";

  let notes = [];

  if (query) {
    // 🔥 Magic Vector AI Search
    notes = await searchNotesAction(query);
  } else {
    // Normal fetch
    const rawNotes = await Note.find().sort({ createdAt: -1 });
    notes = JSON.parse(JSON.stringify(rawNotes));
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        AI Knowledge Base
      </h1>
      
      {/* --- FORM SECTION --- */}
      <form action={createNoteAction} className="space-y-4 bg-gray-50 p-6 rounded-lg dark:bg-gray-800 border dark:border-gray-700 shadow-sm transition hover:shadow-md">
        <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700 text-gray-800 dark:text-gray-200">Add New Knowledge</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">Note Title</label>
          <input 
            type="text" name="title" id="title" required
            className="w-full border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="e.g., How to use Next.js Server Actions" 
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
          <textarea 
            name="content" id="content" rows={4} required
            className="w-full border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="Write your note down here..." 
          />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto shadow">
          Save Knowledge
        </button>
      </form>

      {/* --- SEARCH SECTION --- */}
      <div className="mt-8 border-t pt-8 dark:border-gray-700">
        <form action="/" method="GET" className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={query}
            placeholder="Ask AI your questions..." 
            className="flex-1 border rounded-md p-3 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow shadow-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-md transition-colors shadow flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
              AI Search
            </button>
            {query && (
              <Link href="/" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-md transition-colors shadow-sm flex items-center justify-center">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* --- DISPLAY NOTES SECTION --- */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-700 mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          {query ? "Vector Search Results" : "Your Entire Knowledge Base"}
        </h2>
        
        {notes.length === 0 ? (
          <p className="text-gray-500 italic bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 text-center">
            {query ? "Hmm, couldn't find anything similar in your knowledge base." : "No notes found. Try adding some above!"}
          </p>
        ) : (
          notes.map((note: any) => (
            <div key={note._id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border dark:border-gray-700 transition hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700">
              <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{note.title}</h3>
                  {note.score && (
                      <span className="text-xs font-mono font-medium bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full shrink-0">
                          {Math.round(note.score * 100)}% Match
                      </span>
                  )}
              </div>
              <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="mt-4 flex items-center text-xs text-gray-400 border-t dark:border-gray-700 pt-3">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Saved on: {new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

    </main>
  );
}
