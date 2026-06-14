import { Card } from "@/components/ui/card";
import { TargetIcon } from "lucide-react";
import { sampleData } from "@/lib/sample-data";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function MotivationalCard() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Determine quote by day of year so it rotates daily
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuoteIndex(dayOfYear % sampleData.quotes.length);
  }, []);

  const quote = sampleData.quotes[quoteIndex];

  return (
    <Card className="p-6 flex flex-col justify-between overflow-hidden relative group border-primary/20 h-full min-h-[200px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent z-0 pointer-events-none" />
      <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
        <TargetIcon className="w-48 h-48" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <TargetIcon className="w-6 h-6 text-primary mb-auto" />
        
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quote.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-serif leading-tight italic mb-6 text-foreground"
            >
              "{quote.text}"
            </motion.blockquote>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.cite
              key={quote.author}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-primary font-bold tracking-widest uppercase block not-italic"
            >
              — {quote.author}
            </motion.cite>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
