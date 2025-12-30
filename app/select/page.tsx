'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterCard } from '@/components/character-select/CharacterCard';
import { PaperTexture } from '@/components/ui/PaperTexture';
import { SketchBorder } from '@/components/ui/SketchBorder';
import { AI_CHARACTERS, GAME_CONSTANTS, GAME_TEXT } from '@/lib/game/constants';
import type { AICharacter, WordDifficulty } from '@/types/game-state';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { useSound } from '@/lib/audio/use-sound';

export default function SelectPage() {
  const router = useRouter();
  const { play, ensureAudioContext } = useSound();
  const [selectedAI, setSelectedAI] = useState<AICharacter | null>(null);
  const [roundTime, setRoundTime] = useState(GAME_CONSTANTS.DEFAULT_ROUND_TIME);
  const [totalRounds, setTotalRounds] = useState(GAME_CONSTANTS.DEFAULT_TOTAL_ROUNDS);
  const [difficulty, setDifficulty] = useState<WordDifficulty>(GAME_CONSTANTS.DEFAULT_DIFFICULTY);
  const [isStarting, setIsStarting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const text = GAME_TEXT.ko.select;
  const difficultyText = GAME_TEXT.ko.difficulty;

  const handleStart = async () => {
    if (!selectedAI) return;

    setIsStarting(true);
    play('click');
    await ensureAudioContext();

    try {
      const roomId = nanoid(12);
      const params = new URLSearchParams({
        ai: selectedAI,
        rounds: totalRounds.toString(),
        time: roundTime.toString(),
        difficulty,
      });

      router.push(`/game/${roomId}?${params.toString()}`);
    } catch (error) {
      console.error('Failed to start game:', error);
      setIsStarting(false);
    }
  };

  const handleCharacterSelect = (characterId: AICharacter) => {
    setSelectedAI(characterId);
    // Auto-show settings when character is selected
    if (!showSettings) {
      setTimeout(() => setShowSettings(true), 300);
    }
  };

  const characters = Object.values(AI_CHARACTERS);
  const selectedCharacter = selectedAI ? AI_CHARACTERS[selectedAI] : null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Paper texture background */}
      <PaperTexture />

      {/* Hand-drawn doodles scattered around */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {/* Doodle stars */}
        <motion.svg
          className="absolute top-10 left-10 w-12 h-12"
          viewBox="0 0 100 100"
          animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M50,10 L55,40 L85,40 L60,60 L70,90 L50,70 L30,90 L40,60 L15,40 L45,40 Z"
            fill="none"
            stroke="#5B8FF9"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Doodle arrow */}
        <motion.svg
          className="absolute top-20 right-20 w-20 h-20"
          viewBox="0 0 100 100"
          animate={{ rotate: [-5, 5, -5], x: [0, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M10,50 Q30,45 50,50 T90,50 M75,35 L90,50 L75,65"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Doodle heart */}
        <motion.svg
          className="absolute bottom-20 left-20 w-10 h-10"
          viewBox="0 0 100 100"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M50,85 C25,65 10,50 10,35 C10,20 20,10 30,10 C40,10 45,15 50,25 C55,15 60,10 70,10 C80,10 90,20 90,35 C90,50 75,65 50,85 Z"
            fill="none"
            stroke="#51CF66"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.svg>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-[1400px] mx-auto px-6 w-full">
        {/* Header - Compact */}
        <motion.div
          className="text-center pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        >
          <div className="inline-block relative">
            {/* Main title with hand-drawn style */}
            <motion.h1
              className="text-6xl font-pen tracking-tight relative inline-block"
              style={{
                color: '#2B2B2B',
                transform: 'rotate(-1deg)',
              }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {text.title}

              {/* Scribble underline */}
              <svg
                className="absolute -bottom-1 left-0 w-full h-3"
                viewBox="0 0 400 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M5,15 L45,12 L55,16 L95,12 L105,15 L145,11 L155,16 L195,13 L205,15 L245,12 L255,16 L295,13 L305,15 L345,12 L355,16 L395,14"
                  fill="none"
                  stroke="#FF6B6B"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </motion.h1>

            {/* Doodle star burst */}
            <motion.svg
              className="absolute -top-6 -right-8 w-12 h-12"
              viewBox="0 0 100 100"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <path
                d="M50,0 L55,35 L90,40 L60,60 L70,95 L50,75 L30,95 L40,60 L10,40 L45,35 Z"
                fill="#FFD93D"
                opacity="0.6"
              />
            </motion.svg>
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-2xl font-hand mt-2"
            style={{
              color: '#5B8FF9',
              transform: 'rotate(1deg)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text.subtitle}
          </motion.p>
        </motion.div>

        {/* Step 1: Character Selection - Compact */}
        <div className="flex-shrink-0 pb-4">
          {/* Section label */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <h2
              className="text-3xl font-pen inline-block relative"
              style={{
                color: '#2B2B2B',
                transform: 'rotate(-0.5deg)',
              }}
            >
              🎭 {text.selectCharacter}

              {/* Crayon underline */}
              <svg
                className="absolute -bottom-1 left-0 w-full h-2"
                viewBox="0 0 300 15"
                preserveAspectRatio="none"
              >
                <path
                  d="M5,10 L35,8 L45,11 L75,8 L85,11 L115,9 L125,11 L155,8 L165,11 L195,9 L205,11 L235,8 L245,11 L275,9 L285,11 L295,8"
                  fill="none"
                  stroke="#5B8FF9"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </h2>
          </motion.div>

          {/* Character Grid - Compact */}
          <div className="grid grid-cols-5 gap-4 max-w-[1100px] mx-auto">
            {characters.map((character, index) => {
              const rotations = [-1.5, 1, -0.5, 1.5, -1];
              const rotation = rotations[index % rotations.length];

              return (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20, rotate: rotation }}
                  animate={{ opacity: 1, y: 0, rotate: rotation }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CharacterCard
                    character={character}
                    selected={selectedAI === character.id}
                    onClick={() => handleCharacterSelect(character.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Settings - Appears after selection */}
        <AnimatePresence>
          {selectedAI && selectedCharacter && (
            <motion.div
              className="flex-shrink-0 pb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: showSettings ? 1 : 0, height: showSettings ? 'auto' : 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
                {/* Selected Character Showcase - Compact */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="h-full"
                >
                  <SketchBorder
                    color={selectedCharacter.color}
                    strokeWidth={1.5}
                    borderRadius={24}
                    className="bg-white rounded-3xl h-full"
                    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}
                  >
                  <div className="p-4 text-center space-y-2 h-full flex flex-col justify-center">
                    <h3 className="text-base font-pen text-sketch-dark">선택된 AI</h3>

                    {/* Character Icon */}
                    <motion.div
                      className="py-2"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="relative inline-block">
                        <div
                          className="absolute inset-0 rounded-full blur-xl"
                          style={{ background: `${selectedCharacter.color}50` }}
                        />
                        <div
                          className="relative w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${selectedCharacter.color}25`,
                            border: `3px solid ${selectedCharacter.color}`
                          }}
                        >
                          <span className="text-3xl">
                            {selectedCharacter.id === 'chatgpt' ? '🤖' :
                             selectedCharacter.id === 'gemini' ? '💎' :
                             selectedCharacter.id === 'claude' ? '🎨' :
                             selectedCharacter.id === 'grok' ? '⚡' : '🧠'}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Character Name */}
                    <div>
                      <h4 className="text-xl font-pen" style={{ color: selectedCharacter.color }}>
                        {selectedCharacter.koreanName}
                      </h4>
                      <p className="text-xs font-pen text-sketch-gray">
                        {selectedCharacter.name}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] font-pen text-sketch-gray leading-tight">
                      {selectedCharacter.description}
                    </p>
                  </div>
                  </SketchBorder>
                </motion.div>

                {/* Settings Panel - Compact */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="col-span-3 h-full"
                >
                  <SketchBorder
                    color="#2B2B2B"
                    strokeWidth={1}
                    borderRadius={24}
                    className="bg-white rounded-3xl h-full"
                    style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.05)' }}
                  >
                  <div className="p-4 h-full">
                    {/* Title */}
                    <div className="text-center mb-3">
                    <h2
                      className="text-2xl font-pen inline-block relative"
                      style={{
                        color: '#2B2B2B',
                        transform: 'rotate(-1deg)',
                      }}
                    >
                      ⚙️ {text.settings}
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Round Time */}
                    <div>
                      <label className="block text-lg font-pen mb-2 text-sketch-dark text-center">
                        ⏱️ {text.roundTime}
                      </label>
                      <div className="flex flex-col gap-2">
                        {GAME_CONSTANTS.ROUND_TIME_OPTIONS.map((time, idx) => (
                          <motion.button
                            key={time}
                            onClick={() => {
                              setRoundTime(time);
                              play('click');
                            }}
                            className={clsx(
                              'px-3 py-2 rounded-2xl font-pen text-base transition-all relative',
                              roundTime === time
                                ? 'bg-sketch-blue/20 text-sketch-blue'
                                : 'bg-white/50 text-sketch-gray hover:bg-white/80'
                            )}
                            style={{
                              border: roundTime === time ? '3px solid #5B8FF9' : '2px solid #828282',
                              transform: `rotate(${[-0.5, 0.5, -0.8][idx % 3]}deg)`,
                              boxShadow: roundTime === time ? '4px 4px 0 rgba(91,143,249,0.2)' : '2px 2px 0 rgba(0,0,0,0.05)',
                            }}
                            whileHover={{ scale: 1.05, rotate: 0 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {time}초
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-lg font-pen mb-2 text-sketch-dark text-center">
                        📊 {text.difficulty}
                      </label>
                      <div className="flex flex-col gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff, idx) => (
                          <motion.button
                            key={diff}
                            onClick={() => {
                              setDifficulty(diff);
                              play('click');
                            }}
                            className={clsx(
                              'px-3 py-2 rounded-2xl font-pen text-base transition-all',
                              difficulty === diff
                                ? diff === 'easy'
                                  ? 'bg-sketch-green/20 text-sketch-green'
                                  : diff === 'medium'
                                  ? 'bg-yellow-400/20 text-yellow-700'
                                  : 'bg-sketch-red/20 text-sketch-red'
                                : 'bg-white/50 text-sketch-gray hover:bg-white/80'
                            )}
                            style={{
                              border: difficulty === diff
                                ? diff === 'easy'
                                  ? '3px solid #51CF66'
                                  : diff === 'medium'
                                  ? '3px solid #FFD93D'
                                  : '3px solid #FF6B6B'
                                : '2px solid #828282',
                              transform: `rotate(${[0.5, -0.5, 0.8][idx]}deg)`,
                              boxShadow: difficulty === diff
                                ? diff === 'easy'
                                  ? '4px 4px 0 rgba(81,207,102,0.2)'
                                  : diff === 'medium'
                                  ? '4px 4px 0 rgba(255,217,61,0.2)'
                                  : '4px 4px 0 rgba(255,107,107,0.2)'
                                : '2px 2px 0 rgba(0,0,0,0.05)',
                            }}
                            whileHover={{ scale: 1.05, rotate: 0 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {difficultyText[diff]}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Total Rounds */}
                    <div>
                      <label className="block text-lg font-pen mb-2 text-sketch-dark text-center">
                        🎮 {text.totalRounds}
                      </label>
                      <div className="flex flex-col gap-2">
                        {GAME_CONSTANTS.TOTAL_ROUNDS_OPTIONS.map((rounds, idx) => (
                          <motion.button
                            key={rounds}
                            onClick={() => {
                              setTotalRounds(rounds);
                              play('click');
                            }}
                            className={clsx(
                              'px-3 py-2 rounded-2xl font-pen text-base transition-all',
                              totalRounds === rounds
                                ? 'bg-sketch-green/20 text-sketch-green'
                                : 'bg-white/50 text-sketch-gray hover:bg-white/80'
                            )}
                            style={{
                              border: totalRounds === rounds ? '3px solid #51CF66' : '2px solid #828282',
                              transform: `rotate(${[-0.8, 0.3, -0.3, 0.8, -0.5][idx]}deg)`,
                              boxShadow: totalRounds === rounds ? '4px 4px 0 rgba(81,207,102,0.2)' : '2px 2px 0 rgba(0,0,0,0.05)',
                            }}
                            whileHover={{ scale: 1.05, rotate: 0 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {rounds}라운드
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                  </div>
                  </SketchBorder>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: START BUTTON */}
        <div className="text-center relative py-4 flex-shrink-0">
          {/* Hand-drawn arrows - Animated */}
          <AnimatePresence>
            {selectedAI && showSettings && !isStarting && (
              <>
                {/* Left arrow */}
                <motion.svg
                  className="absolute right-[calc(50%+240px)] top-1/2 -translate-y-1/2 w-20 h-20"
                  viewBox="0 0 100 100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <path
                    d="M10,50 Q30,45 50,50 T80,50 M65,35 L80,50 L65,65"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </motion.svg>

                {/* Right arrow */}
                <motion.svg
                  className="absolute left-[calc(50%+240px)] top-1/2 -translate-y-1/2 w-20 h-20"
                  viewBox="0 0 100 100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
                  }}
                >
                  <path
                    d="M90,50 Q70,45 50,50 T20,50 M35,35 L20,50 L35,65"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleStart}
            disabled={!selectedAI || isStarting}
            className={clsx(
              'relative px-14 py-5 text-3xl font-pen rounded-3xl transition-colors duration-300',
              !selectedAI || isStarting ? 'opacity-40 cursor-not-allowed' : ''
            )}
            style={{
              background: selectedAI && !isStarting
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
                : '#D1D5DB',
              color: 'white',
              boxShadow: selectedAI && !isStarting
                ? '8px 8px 0 rgba(0,0,0,0.15)'
                : '4px 4px 0 rgba(0,0,0,0.1)',
              transform: 'rotate(-1deg)',
            }}
            whileHover={selectedAI && !isStarting ? {
              scale: 1.1,
              rotate: 1,
              y: -5,
            } : {}}
            whileTap={selectedAI && !isStarting ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <SketchBorder
              color={selectedAI && !isStarting ? '#2B2B2B' : '#828282'}
              strokeWidth={selectedAI && !isStarting ? 2 : 1.5}
              borderRadius={24}
              className="absolute inset-0 pointer-events-none rounded-3xl"
            >
              <></>
            </SketchBorder>
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isStarting ? (
                <>
                  <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  준비 중...
                </>
              ) : (
                <>
                  🎮 {text.start} 🚀
                </>
              )}
            </span>

            {/* Crayon texture overlay */}
            {selectedAI && !isStarting && (
              <div
                className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255,255,255,0.3) 2px,
                    rgba(255,255,255,0.3) 4px
                  )`,
                }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
