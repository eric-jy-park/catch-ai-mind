'use client';

import { motion } from 'motion/react';
import { AI_CHARACTERS, type AIPersonality } from '@/lib/game/constants';
import { AILogo } from './AILogo';
import { useSound } from '@/lib/audio/use-sound';

import { SketchBorder } from '@/components/ui/SketchBorder';

interface CharacterCardProps {
  character: AIPersonality;
  selected: boolean;
  onClick: () => void;
}

export function CharacterCard({ character, selected, onClick }: CharacterCardProps) {
  const { play } = useSound();

  const handleClick = () => {
    play('click');
    onClick();
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer h-full"
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="relative h-full"
        animate={{
          y: selected ? -5 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <SketchBorder
          color={character.color}
          strokeWidth={selected ? 3 : 1.5}
          borderRadius={24}
          roughness={selected ? 1.5 : 1}
          className="h-full bg-white rounded-3xl"
        >
          <div className="p-4 h-full flex flex-col items-center">
            {/* Logo Container */}
            <div className="relative mb-3 flex-shrink-0">
              <motion.div
                className="w-20 h-20 mx-auto relative"
                whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Glow effect for selected - Animated */}
                {selected && (
                  <motion.div
                    className="absolute inset-0 rounded-full blur-lg"
                    style={{
                      background: `${character.color}40`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Logo */}
                <div className="relative z-10">
                  <AILogo character={character.id} size={80} />
                </div>

                {/* Hand-drawn star doodles when selected */}
                {selected && (
                  <>
                    <motion.svg
                      className="absolute -top-2 -right-2 w-6 h-6"
                      viewBox="0 0 100 100"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <path
                        d="M50,10 L55,40 L85,45 L60,60 L65,90 L50,75 L35,90 L40,60 L15,45 L45,40 Z"
                        fill={character.color}
                        opacity="0.7"
                      />
                    </motion.svg>
                    <motion.svg
                      className="absolute -bottom-1 -left-1 w-4 h-4"
                      viewBox="0 0 100 100"
                      animate={{
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    >
                      <path
                        d="M50,10 L55,40 L85,45 L60,60 L65,90 L50,75 L35,90 L40,60 L15,45 L45,40 Z"
                        fill={character.color}
                        opacity="0.6"
                      />
                    </motion.svg>
                  </>
                )}
              </motion.div>
            </div>

            {/* Character Info */}
            <div className="text-center space-y-2 flex-grow flex flex-col justify-between w-full">
              {/* English Name with hand-drawn underline */}
              <div className="relative">
                <h3
                  className="text-xl font-hand tracking-tight relative inline-block"
                  style={{
                    color: character.color,
                  }}
                >
                  {character.name}

                  {/* Scribble underline */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-2"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2,4 Q25,2 50,3 T98,5"
                      fill="none"
                      stroke={character.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  </svg>
                </h3>
              </div>

              {/* Korean Name - hand-drawn badge */}
              <div className="relative inline-block">
                <motion.div
                  className="px-3 py-1.5 rounded-2xl font-pen text-base relative inline-block"
                  style={{
                    backgroundColor: `${character.color}20`,
                    color: character.color,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <SketchBorder
                    color={character.color}
                    strokeWidth={1}
                    borderRadius={16}
                    roughness={0.5}
                    className="absolute inset-0 pointer-events-none"
                  >
                     <></>
                  </SketchBorder>

                  <span className="relative z-10">{character.koreanName}</span>
                </motion.div>
              </div>

              {/* Description */}
              <div className="text-xs font-hand text-sketch-gray px-1 leading-tight min-h-[2.5em] flex items-center justify-center">
                {character.description}
              </div>

              {/* Stats with sketchy badges */}
              <div className="flex gap-1.5 justify-center flex-wrap pt-1">
                <motion.div
                  className="px-2 py-1 rounded-full text-xs font-pen relative"
                  style={{
                    backgroundColor: `${character.color}10`,
                    color: character.color,
                  }}
                  whileHover={{ scale: 1.05, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <SketchBorder
                    color={character.color}
                    strokeWidth={1}
                    borderRadius={12}
                    roughness={0.5}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <></>
                  </SketchBorder>
                  <span className="relative z-10">
                    ✏️ {character.drawingStyle === 'precise' ? '정밀' :
                        character.drawingStyle === 'rough' ? '러프' :
                        character.drawingStyle === 'artistic' ? '예술적' :
                        character.drawingStyle === 'minimalist' ? '미니멀' : '혼돈'}
                  </span>
                </motion.div>
                <motion.div
                  className="px-2 py-1 rounded-full text-xs font-pen relative"
                  style={{
                    backgroundColor: `${character.color}10`,
                    color: character.color,
                  }}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <SketchBorder
                    color={character.color}
                    strokeWidth={1}
                    borderRadius={12}
                    roughness={0.5}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <></>
                  </SketchBorder>
                  <span className="relative z-10">
                    ⚡ {character.thinkingSpeed < 1800 ? '빠름' : character.thinkingSpeed > 2000 ? '느림' : '보통'}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Selection checkmark with hand-drawn circle */}
            {selected && (
              <motion.div
                className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15
                }}
              >
                {/* Hand-drawn circle background */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="#FFD93D"
                    opacity="0.9"
                  />
                  <path
                    d="M 50,5 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"
                    fill="none"
                    stroke="#2B2B2B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="10 5"
                  />
                </svg>

                {/* Checkmark */}
                <motion.svg
                  className="relative z-10 w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="#2B2B2B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            )}
          </div>
        </SketchBorder>
      </motion.div>
    </motion.div>
  );
}
