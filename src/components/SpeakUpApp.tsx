"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  Play,
  Pause,
  Lightbulb,
  Volume2,
  VolumeX,
  Wand2,
  Scroll,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { Topic, Mood } from "@/lib/speakup-data";

const MOODS: (Mood | "All")[] = [
  "All",
  "Casual",
  "Deep",
  "Professional",
  "Personal",
];

const PARTICLE_COUNT = 18;
const TIMER_CIRCUMFERENCE = 653.45;

/** Smooth, settled springs — GPU-friendly (opacity / transform only on views). */
const springOpen = (reduced: boolean) =>
  reduced
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.82 };

const springSnappy = (reduced: boolean) =>
  reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 440, damping: 30, mass: 0.65 };

const springFlip = (reduced: boolean) =>
  reduced
    ? { duration: 0.25 }
    : { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.9 };

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function FloatingParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {[...Array(PARTICLE_COUNT)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold/40 rounded-full blur-[1px] will-change-transform"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, "-20%", "120%"],
            x: [null, (Math.random() - 0.5) * 40 + "%"],
            opacity: [0, 0.8, 0],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: Math.random() * 12 + 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}
    </div>
  );
}

function SoundWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gold rounded-full transition-all duration-300 ${active ? "animate-soundwave" : "h-1 opacity-30"}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface CardProps {
  topic: Topic;
  index: number;
  onSelect: (id: number) => void;
  isFlipped: boolean;
  reducedMotion: boolean;
}

const Card = React.memo(function Card({
  topic,
  index,
  onSelect,
  isFlipped,
  reducedMotion,
}: CardProps) {
  const flipTransition = springFlip(reducedMotion);
  const hoverTransition = springSnappy(reducedMotion);

  return (
    <motion.div
      className="speakup-card-shell relative w-full aspect-[3/4] perspective-1000 cursor-pointer"
      onClick={() => onSelect(topic.id)}
      whileHover={
        reducedMotion
          ? undefined
          : { scale: 1.04, rotateZ: 0.8, transition: hoverTransition }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.97, transition: hoverTransition }}
      transition={hoverTransition}
    >
      <motion.div
        className="w-full h-full preserve-3d relative will-change-transform"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={flipTransition}
      >
        <div className="absolute inset-0 glass-card flex flex-col items-center justify-center p-4 backface-hidden overflow-hidden">
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-gold/30" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/30" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold/30" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-gold/30" />

          <div className="w-16 h-16 rounded-full wax-seal flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <Wand2 className="w-8 h-8 text-parchment/80" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/60">
            Enchantment
          </span>
          <span className="text-3xl font-serif font-bold parchment-text">
            #{index + 1}
          </span>
        </div>

        <div className="absolute inset-0 glass-card flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 bg-burgundy/20">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'url("https://www.transparenttextures.com/patterns/parchment.png")',
            }}
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/60 mb-4">
            {topic.mood}
          </span>
          <p className="text-center font-serif text-xl leading-relaxed text-parchment">
            &quot;{topic.text}&quot;
          </p>
          <div className="mt-6 w-8 h-[1px] bg-gold/30" />
        </div>
      </motion.div>
    </motion.div>
  );
});

function TimerRing({
  practiceTime,
  initialTime,
  isTimerRunning,
  reducedMotion,
}: {
  practiceTime: number;
  initialTime: number;
  isTimerRunning: boolean;
  reducedMotion: boolean;
}) {
  const safeInitial = Math.max(initialTime, 1);
  const dashOffset =
    TIMER_CIRCUMFERENCE * (1 - practiceTime / safeInitial);

  const transition = reducedMotion
    ? "none"
    : isTimerRunning
      ? "stroke-dashoffset 0.92s linear"
      : "stroke-dashoffset 0.45s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224">
      <circle
        cx="112"
        cy="112"
        r="104"
        className="stroke-white/5 fill-none"
        strokeWidth="2"
      />
      <circle
        cx="112"
        cy="112"
        r="104"
        className="stroke-gold fill-none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={TIMER_CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        style={{
          filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))",
          transition,
        }}
      />
    </svg>
  );
}

type SpeakUpAppProps = {
  initialTopics: Topic[];
};

export default function SpeakUpApp({ initialTopics }: SpeakUpAppProps) {
  const reducedMotion = usePrefersReducedMotion();
  const sourceTopicsRef = useRef(initialTopics);
  sourceTopicsRef.current = initialTopics;
  const [randomizedTopics, setRandomizedTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [filter, setFilter] = useState<Mood | "All">("All");
  const [isStageMode, setIsStageMode] = useState(false);

  const [practiceTime, setPracticeTime] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [showHints, setShowHints] = useState(false);
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const openSpring = useMemo(() => springOpen(reducedMotion), [reducedMotion]);

  const shuffleTopics = useCallback(() => {
    const src = sourceTopicsRef.current;
    if (src.length === 0) return;
    const shuffled = [...src].sort(() => Math.random() - 0.5);
    setRandomizedTopics(shuffled);
  }, []);

  useEffect(() => {
    shuffleTopics();
  }, [shuffleTopics]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setPracticeTime((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            confetti({
              particleCount: 120,
              spread: 85,
              origin: { y: 0.6 },
              colors: ["#fbbf24", "#450a0a", "#fef3c7"],
              disableForReducedMotion: true,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (isAmbienceOn) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
      );
      audio.loop = true;
      audio.volume = 0.15;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isAmbienceOn]);

  const handleSelectCard = useCallback(
    (id: number) => {
      const topic = randomizedTopics.find((t) => t.id === id);
      if (!topic) return;
      setSelectedTopic(topic);
      const delay = reducedMotion ? 0 : 520;
      window.setTimeout(() => {
        setIsStageMode(true);
        setPracticeTime(60);
        setInitialTime(60);
        setIsTimerRunning(false);
      }, delay);
    },
    [randomizedTopics, reducedMotion]
  );

  const resetPractice = useCallback(() => {
    setIsTimerRunning(false);
    setPracticeTime(60);
    setInitialTime(60);
    setShowHints(false);
  }, []);

  const exitStage = useCallback(() => {
    setIsStageMode(false);
    setSelectedTopic(null);
    resetPractice();
    shuffleTopics();
  }, [resetPractice, shuffleTopics]);

  const addTime = useCallback(() => {
    if (!isTimerRunning) {
      setPracticeTime((prev) => prev + 30);
      setInitialTime((prev) => prev + 30);
    }
  }, [isTimerRunning]);

  const visibleTopics = useMemo(() => {
    if (filter === "All") return randomizedTopics;
    return randomizedTopics.filter((t) => t.mood === filter);
  }, [randomizedTopics, filter]);

  return (
    <div
      className={`flex flex-col relative z-10 ${
        isStageMode
          ? "min-h-[100dvh] h-[100dvh] overflow-hidden"
          : "min-h-screen"
      }`}
    >
      <FloatingParticles reducedMotion={reducedMotion} />

      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-50 opacity-20">
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-gold rounded-tl-3xl" />
        <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-gold/50 rounded-tl-xl" />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-50 opacity-20">
        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-gold rounded-tr-3xl" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-gold/50 rounded-tr-xl" />
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none z-50 opacity-20">
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-gold rounded-bl-3xl" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-gold/50 rounded-bl-xl" />
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-50 opacity-20">
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-gold rounded-br-3xl" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-gold/50 rounded-br-xl" />
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-burgundy/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/10 blur-[150px] rounded-full" />
      </div>

      <header
        className={`px-6 flex items-center justify-between max-w-7xl mx-auto w-full shrink-0 ${
          isStageMode ? "py-3 md:py-4" : "py-10"
        }`}
      >
        <div
          className="flex items-center gap-4 group cursor-pointer"
          onClick={exitStage}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              exitStage();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="w-12 h-12 rounded-full wax-seal flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
            <Flame className="w-6 h-6 text-parchment" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-widest parchment-text uppercase text-gold">
            SpeakUp
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsAmbienceOn(!isAmbienceOn)}
            className={`p-3 rounded-full transition-all border ${isAmbienceOn ? "bg-gold/20 border-gold/40 text-gold" : "bg-white/5 border-white/10 text-parchment/40 hover:text-parchment"}`}
            title="Magical Ambience"
          >
            {isAmbienceOn ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <main
        className={`max-w-7xl mx-auto w-full px-6 ${
          isStageMode
            ? "flex-1 min-h-0 flex flex-col pb-3 overflow-y-auto overscroll-contain"
            : "flex-1 pb-24"
        }`}
      >
        <AnimatePresence mode="wait">
          {!isStageMode ? (
            <motion.div
              key="grid"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10, scale: 0.985 }
              }
              transition={openSpring}
              className="space-y-16"
            >
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-serif font-bold text-parchment leading-tight">
                  The Chamber of Eloquence
                </h2>
                <p className="text-gold/60 text-xl font-serif italic">
                  Choose your enchantment and reveal the path to mastery.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {MOODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setFilter(m)}
                    className={`px-8 py-2.5 rounded-full text-sm font-serif tracking-widest transition-all border ${
                      filter === m
                        ? "bg-gold border-gold text-wizard-bg font-bold shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                        : "bg-white/5 border-white/10 text-parchment/50 hover:bg-white/10 hover:border-gold/30 hover:text-parchment"
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>

              {visibleTopics.length === 0 ? (
                <p className="text-center text-parchment/50 font-serif italic text-lg py-16 max-w-md mx-auto">
                  {randomizedTopics.length === 0
                    ? "Preparing the chamber…"
                    : `No ${filter === "All" ? "" : `${filter} `}enchantments in this draw. Try another mood or return from a card to shuffle again.`}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {visibleTopics.map((item, idx) => (
                    <Card
                      key={item.id}
                      topic={item}
                      index={idx}
                      onSelect={handleSelectCard}
                      isFlipped={selectedTopic?.id === item.id}
                      reducedMotion={reducedMotion}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="stage"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              transition={openSpring}
              className="flex flex-1 min-h-0 flex-col w-full max-w-4xl mx-auto gap-3 md:gap-4 py-1"
            >
              <button
                type="button"
                onClick={exitStage}
                className="shrink-0 flex items-center gap-2 text-gold/60 hover:text-gold transition-colors duration-200 group font-serif italic text-sm"
              >
                <Scroll className="w-4 h-4 shrink-0 group-hover:-rotate-12 transition-transform duration-300" />
                Return to Chamber
              </button>

              <div className="flex flex-1 min-h-0 flex-col gap-3 md:gap-4 text-center relative w-full">
                <div className="absolute inset-0 -z-10 rounded-3xl border border-gold/10 pointer-events-none" />
                <div className="absolute inset-[3px] -z-10 rounded-[1.35rem] border border-gold/5 pointer-events-none" />

                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    ...openSpring,
                    delay: reducedMotion ? 0 : 0.08,
                  }}
                  className="shrink-0 flex flex-col gap-2 md:gap-3 min-h-0"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-8 md:w-10 bg-gold/30" />
                    <span className="text-gold font-serif italic tracking-[0.15em] text-[10px] md:text-xs uppercase">
                      {selectedTopic?.mood} Enchantment
                    </span>
                    <div className="h-px w-8 md:w-10 bg-gold/30" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold parchment-text leading-snug px-2 max-h-[min(28vh,12rem)] sm:max-h-[min(32vh,14rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                    {selectedTopic?.text}
                  </h2>
                </motion.div>

                <div className="shrink-0 flex flex-col items-center gap-3 md:gap-4">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center">
                    <TimerRing
                      practiceTime={practiceTime}
                      initialTime={initialTime}
                      isTimerRunning={isTimerRunning}
                      reducedMotion={reducedMotion}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-gold/40 mb-1">
                        Incantation Time
                      </span>
                      <span className="text-4xl sm:text-5xl font-mono font-bold parchment-text tabular-nums leading-none">
                        {practiceTime}
                      </span>
                    </div>
                  </div>

                  <SoundWave active={isTimerRunning} />
                </div>

                <div className="shrink-0 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={resetPractice}
                    className="p-3.5 rounded-full glass hover:bg-white/10 text-gold/60 hover:text-gold transition-colors duration-200 border border-gold/20"
                    title="Reset Incantation"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  {!isTimerRunning && (
                    <button
                      type="button"
                      onClick={addTime}
                      className="px-5 py-2.5 rounded-xl glass hover:bg-gold/10 text-gold font-serif italic text-xs transition-colors duration-200 flex items-center gap-2 border border-gold/30 group"
                      title="Extend Time"
                    >
                      <Flame className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                      +30s
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-full bg-gold text-wizard-bg flex items-center justify-center hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 ease-out shadow-[0_0_28px_rgba(251,191,36,0.35)]"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-8 h-8 sm:w-9 sm:h-9 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current translate-x-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className={`p-3.5 rounded-full transition-colors duration-200 border ${showHints ? "bg-gold border-gold text-wizard-bg" : "glass text-gold/60 hover:bg-white/10 border-gold/20"}`}
                    title="Reveal Guidance"
                  >
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>

                <AnimatePresence>
                  {showHints && (
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      transition={openSpring}
                      className="w-full shrink-0 min-h-0 max-h-[32vh] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
                    >
                      <div className="glass p-4 sm:p-6 rounded-2xl text-left max-w-2xl mx-auto space-y-3 border border-gold/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                        <h4 className="text-gold font-serif italic text-base tracking-widest flex items-center gap-2">
                          <Wand2 className="w-4 h-4 shrink-0" /> Ancient Wisdom
                        </h4>
                        <ul className="space-y-2.5">
                          {selectedTopic?.hints.map((hint, i) => (
                            <li
                              key={i}
                              className="text-parchment/70 flex items-start gap-3 font-serif italic text-sm sm:text-base"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                              {hint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer
        className={`px-6 py-12 border-t border-gold/5 mt-auto bg-wizard-bg/50 backdrop-blur-sm ${
          isStageMode ? "hidden" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 text-gold/30 text-xs font-serif tracking-[0.2em] uppercase">
          <p>© 2026 SpeakUp. The magic is within you.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-gold transition-colors">
              The Archives
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Covenants
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Summon Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
