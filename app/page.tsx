import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 max-w-2xl w-full">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h1 className="text-5xl font-bold text-white mb-4">SkyScan</h1>
            <p className="text-gray-400 text-lg">
                Your solution for billboard registration and complaint management.
            </p>
            <a href="/billboard-reg">
                <button className="mt-8 bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform shadow-lg shadow-purple-500/50 hover:bg-purple-700 hover:scale-105">
                    Register a Billboard
                </button>
            </a>
        </div>
    </div>
  );
};
