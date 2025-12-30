import type { AICharacter } from '@/types/game-state';

export interface AIPersonality {
  id: AICharacter;
  name: string;
  koreanName: string;
  description: string;
  personality: string;
  drawingStyle: 'precise' | 'rough' | 'artistic' | 'minimalist' | 'chaotic';
  guessingBehavior: 'analytical' | 'intuitive' | 'random' | 'confident' | 'funny';
  thinkingSpeed: number; // milliseconds
  errorRate: number; // 0-1
  color: string;
}

export const AI_CHARACTERS: Record<AICharacter, AIPersonality> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    koreanName: '모범생',
    description: '100점 아니면 불만인 완벽주의자',
    personality: '친근하지만 거슬릴정도로 정확한',
    drawingStyle: 'precise',
    guessingBehavior: 'analytical',
    thinkingSpeed: 2000,
    errorRate: 0.15,
    color: '#10A37F',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    koreanName: '이중인격',
    description: '천재와 바보 사이를 넘나드는 쌍둥이',
    personality: '매 순간 다른 사람으로 변신',
    drawingStyle: 'artistic',
    guessingBehavior: 'intuitive',
    thinkingSpeed: 1800,
    errorRate: 0.12,
    color: '#4285F4',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    koreanName: '사색가',
    description: '생각이 너무 많아서 느린 철학자',
    personality: '심오한척 하지만 사실은 그냥 느림',
    drawingStyle: 'minimalist',
    guessingBehavior: 'analytical',
    thinkingSpeed: 2200,
    errorRate: 0.10,
    color: '#C97D60',
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    koreanName: '광기',
    description: '예측불가! 규칙따윈 모르는 반항아',
    personality: '카오스의 화신, 뭘 할지 나도 몰라',
    drawingStyle: 'chaotic',
    guessingBehavior: 'funny',
    thinkingSpeed: 1500,
    errorRate: 0.25,
    color: '#000000',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    koreanName: '다크호스',
    description: '조용히 1등을 노리는 숨은 강자',
    personality: '말은 없지만 실력은 확실한',
    drawingStyle: 'rough',
    guessingBehavior: 'confident',
    thinkingSpeed: 1600,
    errorRate: 0.18,
    color: '#2D3748',
  },
};

export const GAME_CONSTANTS = {
  DEFAULT_ROUND_TIME: 60,
  DEFAULT_TOTAL_ROUNDS: 10,
  DEFAULT_DIFFICULTY: 'medium' as const,
  MIN_ROUNDS: 3,
  MAX_ROUNDS: 20,
  ROUND_TIME_OPTIONS: [30, 60, 90] as const,
  TOTAL_ROUNDS_OPTIONS: [3, 5, 10, 15, 20] as const,
  AD_BREAK_DURATION: 15,
  ROUND_END_DISPLAY_DURATION: 5,
  WORD_REVEAL_DURATION: 3,
};

// Funny/wild guesses for the "funny" guessing behavior
// These are tangentially related but clearly wrong - making for funny moments
export const FUNNY_GUESS_WORDS: Record<string, string[]> = {
  '동물': ['기린', '다람쥐', '참새', '고래', '나비', '문어', '달팽이', '코끼리', '부엉이', '사자', '호랑이', '수달', '멧돼지', '독수리', '타조'],
  '음식': ['김밥', '피자', '햄버거', '떡볶이', '파스타', '샌드위치', '샐러드', '라멘', '짬뽕', '설렁탕', '비빔밥', '볶음밥', '초밥', '타코'],
  '활동': ['달리기', '수영', '축구', '농구', '등산', '자전거', 'rollerskating', '독서', '요리', '게임', '낚시', '캠핑', '러닝', '요가'],
  '장소': ['도서관', '병원', '학교', '공원', '해변', '산', '강', '호텔', '식당', '카페', '극장', '박물관', '지하철', '비행기'],
  '물건': ['시계', '안경', '전화', '컴퓨터', '의자', '침대', '냉장고', '세탁기', ' Television', '선풍기', '加湿기', '노트북', '스마트폰'],
  '감정': ['기쁨', '슬픔', '분노', '놀라움', '지루함', '졸림', '배고픔', '목마름', '짜증', '설렘', '불안', '평화', '행복'],
  '계절': ['봄', '여름', '가을', '겨울', '태풍', '눈보라', '폭염', '장마', '무지개', '이슬', '서리', '번개', '달'],
  '색상': ['빨강', '파랑', '초록', '노랑', '보라', '주황', '분홍', '검정', '흰색', '회색', '갈색', '하늘색', ' navy'],
  '숫자': ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '백', '천', '만', '억'],
  '교통': ['자동차', '비행기', '배', '기차', '버스', '지하철', '트럭', '오토바이', '자전거', '전동킥보드', '택시'],
};

export const GAME_TEXT = {
  ko: {
    select: {
      title: 'Catch AI Mind',
      subtitle: '캐치 AI 마인드',
      selectCharacter: 'AI 캐릭터를 선택하세요',
      settings: '게임 설정',
      roundTime: '라운드 시간',
      totalRounds: '라운드 수',
      difficulty: '난이도',
      start: '게임 시작',
    },
    game: {
      yourTurn: '당신의 차례',
      aiTurn: 'AI의 차례',
      drawing: '그리는 중...',
      guessing: '맞춰보세요!',
      targetWord: '그릴 단어',
      enterGuess: '정답을 입력하세요',
      submit: '전송',
      roundOf: '라운드',
      timeLeft: '남은 시간',
      yourScore: '당신',
      aiScore: 'AI',
      correct: '정답!',
      incorrect: '오답',
      gameOver: '게임 종료',
      winner: '승자',
      playAgain: '다시 하기',
      newCharacter: '새 캐릭터 선택',
      youDraw: '당신이 그립니다',
      youGuess: '당신이 맞춥니다',
    },
    difficulty: {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움',
    },
  },
};
