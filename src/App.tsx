import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, History, Globe, Landmark, Palette, Trophy, Film, Beaker, Calculator, RefreshCw, Bell } from 'lucide-react';
import { generateDailyTrivia, Trivia } from './services/gemini';

const CategoryIcon = ({ category }: { category: string }) => {
  const c = category.toLowerCase();
  if (c.includes('history')) return <History className="w-5 h-5" />;
  if (c.includes('geography')) return <Globe className="w-5 h-5" />;
  if (c.includes('politics')) return <Landmark className="w-5 h-5" />;
  if (c.includes('art')) return <Palette className="w-5 h-5" />;
  if (c.includes('sports')) return <Trophy className="w-5 h-5" />;
  if (c.includes('entertainment')) return <Film className="w-5 h-5" />;
  if (c.includes('science')) return <Beaker className="w-5 h-5" />;
  if (c.includes('math')) return <Calculator className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

export default function App() {
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const fetchTrivia = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try to fetch from our local backend
      const res = await fetch('/api/trivia/today');
      if (res.ok) {
        const data = await res.json();
        setTrivia(data);
      } else {
        // 2. If not found, generate using Gemini
        const newTrivia = await generateDailyTrivia();
        setTrivia(newTrivia);
        
        // 3. Save to backend for others
        await fetch('/api/trivia/today', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTrivia),
        });
      }
      
      // Simulate a notification arrival after a short delay if it's the first time
      setTimeout(() => setShowNotification(true), 1000);
    } catch (err) {
      console.error(err);
      setError('Failed to load today\'s trivia. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrivia();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100 flex flex-col items-center justify-center p-6">
      {/* Simulated Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white rounded-2xl shadow-lg border border-black/5 p-4 flex items-start gap-4 z-50 cursor-pointer"
            onClick={() => setShowNotification(false)}
          >
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Daily Trivia</h3>
              <p className="text-xs text-gray-500">Your trivia for today is ready! Tap to reveal.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full max-w-md">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-white border border-black/5 rounded-full text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-4"
          >
            {today}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-light tracking-tight"
          >
            Daily <span className="font-semibold">Trivia</span>
          </motion.h1>
        </header>

        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Fetching Knowledge...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-red-100">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchTrivia}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : trivia ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/5"
            >
              <div className="flex items-center gap-2 text-emerald-600 mb-6">
                <CategoryIcon category={trivia.category} />
                <span className="text-xs font-bold uppercase tracking-widest">{trivia.category}</span>
              </div>

              <h2 className="text-2xl font-medium leading-snug mb-8">
                {trivia.question}
              </h2>

              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.button
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
                  >
                    Reveal Answer
                  </motion.button>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Answer</p>
                      <p className="text-xl font-semibold text-emerald-900">{trivia.answer}</p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Did you know?</p>
                      <p className="text-sm leading-relaxed text-gray-600 italic">
                        "{trivia.fact}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            One fact. Every day. No bloat.
          </p>
        </footer>
      </main>
    </div>
  );
}

