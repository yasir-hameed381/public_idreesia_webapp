'use client'

export default function loading({ error, reset }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-amber-100 border border-amber-300 text-amber-500 px-6 py-4 rounded-lg shadow-md text-center">
        <p className="text-lg font-semibold">   Loading .....</p>
       
      </div>
    </div>
  );
}
