import OpenAI from "openai";
import type { AICharacter } from "@/types/game-state";
import { FUNNY_GUESS_WORDS } from "@/lib/game/constants";

const AI_MODEL_MAP: Record<AICharacter, string> = {
  chatgpt: "openai/gpt-4o-mini", // non-reasoning, cheap, fast
  gemini: "google/gemini-2.5-flash-lite", // cheapest Gemini family
  claude: "anthropic/claude-3-haiku", // maps to Claude Haiku 3 (cheapest Claude tier)
  grok: "x-ai/grok-2-1212", // Grok 2 (non-reasoning)
  deepseek: "deepseek/deepseek-chat", // DeepSeek chat (V3 family on OR)
};

// Initialize OpenAI client with OpenRouter
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Catch AI Mind",
  },
});

export interface AIDrawingRequest {
  word: string;
  category: string;
  character: AICharacter;
  personality: string;
  drawingStyle: string;
}

export interface AIGuessingRequest {
  character: AICharacter;
  personality: string;
  guessingBehavior: string;
  category?: string;
  previousGuesses?: string[];
  elements?: any[]; // Excalidraw elements
}

/**
 * Generate drawing instructions for an AI character
 * Returns JSON with Excalidraw elements
 */
export async function generateDrawing(
  request: AIDrawingRequest
): Promise<any[]> {
  const model = AI_MODEL_MAP[request.character];

  const systemPrompt = `Draw "${request.word}" with 3-5 shapes. JSON only:`;

  const userPrompt = `{"elements":[{"type":"ellipse","x":250,"y":250,"width":100,"height":100,"strokeColor":"#000","roughness":1}`;

  try {
    const responsePromise = openrouter.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" },
      provider: {
        require_parameters: false,
        allow_fallbacks: false,
        data_collection: "deny",
        ignore: ["reasoning", "thought_process"],
      },
    } as any);

    const timeoutMs = 5000;
    const response = await Promise.race([
      responsePromise,
      new Promise((resolve) => setTimeout(() => resolve("timeout"), timeoutMs)),
    ]);

    if (response === "timeout") {
      console.warn("[API/DRAW] generateDrawing timed out");
      return [];
    }

    // Type assertion after timeout check
    const chatResponse = response as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = chatResponse.choices?.[0]?.message?.content || "[]";
    console.log("[API/DRAW] AI Raw Content Length:", content.length);
    console.log("[API/DRAW] AI Raw Content Start:", content.substring(0, 200));

    // Improved JSON extraction:
    // 1. Try finding json code block
    // 2. Try finding array brackets directly
    // 3. Cleanup possible markdown noise

    let jsonStr = content;
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      console.log("[API/DRAW] Found JSON code block");
      jsonStr = jsonBlockMatch[1];
    } else {
      // Fallback: Find the first '{' and last '}'
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        console.log("[API/DRAW] Found object brackets");
        jsonStr = content.substring(start, end + 1);
      } else {
        // Double fallback: maybe it returned an array directly despite instructions
        const startArr = content.indexOf("[");
        const endArr = content.lastIndexOf("]");
        if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
          console.log("[API/DRAW] Found array brackets (fallback)");
          jsonStr = content.substring(startArr, endArr + 1);
        } else {
          console.warn("[API/DRAW] No JSON structure found");
        }
      }
    }

    // Attempt parsing
    try {
      const parsed = JSON.parse(jsonStr);
      let elements = [];

      if (Array.isArray(parsed)) {
        elements = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.elements)) {
          elements = parsed.elements;
        } else {
          // Check if it's the error object we saw earlier
          console.warn(
            "[API/DRAW] Parsed object does not contain elements array:",
            parsed
          );
        }
      }

      if (!Array.isArray(elements) || elements.length === 0) {
        console.error("[API/DRAW] No valid elements found in response");
        return [];
      }

      return elements;
    } catch (parseError) {
      console.error("[API/DRAW] JSON Parse Error:", parseError);
      console.error(
        "[API/DRAW] Failed JSON String:",
        jsonStr.substring(0, 500)
      );
      return [];
    }
  } catch (error) {
    console.error("Error generating drawing:", error);
    return [];
  }
}

// Helper to downsample points for prompt efficiency
function summarizePoints(points: any[]): any[] {
  if (!points || !Array.isArray(points)) return [];
  if (points.length <= 10) return points;

  // Take start, end, and 8 evenly distributed points in between
  const step = Math.floor((points.length - 1) / 9);
  const result = [];
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  // Ensure last point is included
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  return result;
}

/**
 * Generate a funny/wild guess for comedic effect
 */
/**
 * Describe element in semantic terms
 */
function describeElement(e: any, index: number): string {
  const desc: string[] = [`Element ${index + 1}:`];
  
  // Type and size
  desc.push(`  Type: ${e.type}`);
  desc.push(`  Position: (${e.x}, ${e.y})`);
  desc.push(`  Size: ${e.w}×${e.h}`);
  
  // Shape description
  if (e.type === 'rectangle' || e.type === 'ellipse') {
    const aspect = e.w / Math.max(e.h, 1);
    if (aspect > 1.5) desc.push(`  Shape: horizontal ${e.type}`);
    else if (aspect < 0.66) desc.push(`  Shape: vertical ${e.type}`);
    else desc.push(`  Shape: roughly square ${e.type}`);
  }
  
  // Line/stroke patterns
  if (e.points && e.points.length > 0) {
    const points = e.points;
    const startX = points[0][0];
    const startY = points[0][1];
    const endX = points[points.length - 1][0];
    const endY = points[points.length - 1][1];
    
    const dx = endX - startX;
    const dy = endY - startY;
    
    // Determine stroke direction/pattern
    if (Math.abs(dx) < 10 && Math.abs(dy) > 30) {
      desc.push(`  Stroke: VERTICAL line (${Math.abs(dy)}px long)`);
    } else if (Math.abs(dy) < 10 && Math.abs(dx) > 30) {
      desc.push(`  Stroke: HORIZONTAL line (${Math.abs(dx)}px long)`);
    } else if (points.length > 10) {
      // Check for curved patterns
      const isCurved = points.some((p: any, i: number) => {
        if (i < 2) return false;
        const prev = points[i - 1];
        const prevPrev = points[i - 2];
        return Math.abs((p[0] - prev[0]) - (prev[0] - prevPrev[0])) > 5;
      });
      if (isCurved) {
        desc.push(`  Stroke: CURVED/CIRCULAR path`);
      } else {
        desc.push(`  Stroke: diagonal/angled line`);
      }
    }
  }
  
  return desc.join('\n');
}

/**
 * Analyze drawing elements to extract meaningful patterns
 */
function analyzeDrawing(elements: any[]): string {
  if (!elements || elements.length === 0) {
    return "⚠️ EMPTY CANVAS - Make an educated guess from the category!";
  }

  const analysis: string[] = [];
  
  analysis.push(`📊 DRAWING ANALYSIS (${elements.length} elements):`);
  analysis.push('');

  // Group elements by position to detect character patterns
  const groups = new Map<string, any[]>();
  elements.forEach(e => {
    // Round to nearest 100 to group nearby elements
    const key = `${Math.floor(e.x / 100)}_${Math.floor(e.y / 100)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });

  if (groups.size > 1 && groups.size < elements.length) {
    analysis.push(`🔤 PATTERN DETECTED: ${groups.size} distinct character-like groups`);
    analysis.push('   ⚠️ This looks like TEXT/LETTERS - try to decode Korean characters!');
    analysis.push('');
    
    // Describe each group
    let groupNum = 1;
    groups.forEach((groupElements, key) => {
      analysis.push(`📝 Character Group ${groupNum}:`);
      groupElements.forEach((e, i) => {
        analysis.push(describeElement(e, i));
      });
      analysis.push('');
      groupNum++;
    });
  } else {
    // Describe all elements
    analysis.push('📋 Individual Elements:');
    elements.slice(0, 8).forEach((e, i) => {
      analysis.push(describeElement(e, i));
      analysis.push('');
    });
    
    if (elements.length > 8) {
      analysis.push(`... and ${elements.length - 8} more elements`);
    }
  }

  return analysis.join('\n');
}

/**
 * Generate a funny/wild guess for comedic effect
 */
function generateFunnyGuess(category?: string): string {
  // Get category-specific words, or use a mix of all categories
  let words: string[];
  if (category && FUNNY_GUESS_WORDS[category]) {
    words = FUNNY_GUESS_WORDS[category];
  } else {
    // Flatten all category words
    words = Object.values(FUNNY_GUESS_WORDS).flat();
  }

  // Pick a random word
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

/**
 * Generate a guess for what's being drawn
 * Returns a Korean word guess
 */
export async function generateGuess(
  request: AIGuessingRequest
): Promise<string> {
  // Handle funny behavior specially - pick random funny words for comedic effect
  if (request.guessingBehavior === "funny") {
    const funnyGuess = generateFunnyGuess(request.category);
    console.log(
      `[API/GUESS] Funny mode: picked "${funnyGuess}" from category "${request.category}"`
    );
    return funnyGuess;
  }

  const model = AI_MODEL_MAP[request.character];

  // Simplify elements for the prompt to avoid token limits while preserving shape info
  const simplifiedElements =
    request.elements?.map((e) => {
      const base = {
        type: e.type,
        x: Math.round(e.x),
        y: Math.round(e.y),
        w: Math.round(e.width),
        h: Math.round(e.height),
        color: e.strokeColor,
      };

      // For lines/drawings, add simplified points path
      if (e.type === "freedraw" || e.type === "line" || e.type === "arrow") {
        return {
          ...base,
          points: summarizePoints(e.points).map((p: any) => [
            Math.round(p[0]),
            Math.round(p[1]),
          ]),
        };
      }
      return base;
    }) || [];

  const describeDrawing = () => {
    if (simplifiedElements.length === 0) return "Empty canvas";
    
    const shapes = simplifiedElements.map((e: any) => {
      if (e.type === 'ellipse') return `circle at (${e.x},${e.y})`;
      if (e.type === 'rectangle') return `rectangle at (${e.x},${e.y})`;
      if (e.type === 'line' || e.type === 'freedraw') {
        const start = e.points?.[0] || [0,0];
        const end = e.points?.[e.points.length-1] || [0,0];
        return `line from (${Math.round(e.x+start[0])},${Math.round(e.y+start[1])}) to (${Math.round(e.x+end[0])},${Math.round(e.y+end[1])})`;
      }
      return e.type;
    });
    
    return shapes.slice(0, 15).join(', ');
  };

  const systemPrompt = `Pictionary game. Category hint: ${request.category}

Drawing: ${describeDrawing()}

${request.previousGuesses?.length ? `Wrong: ${request.previousGuesses.join(", ")}` : ""}

Guess a Korean word from this category based on the drawing. Output ONLY the Korean word.`;

  const userPrompt = `Korean word:`;

  try {
    console.log(
      `[API/GUESS] Sending prompt to ${model}. Elements: ${simplifiedElements.length}`
    );

    const response = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature:
        request.guessingBehavior === "random"
          ? 1.2
          : request.guessingBehavior === "funny"
          ? 1.5
          : 0.7,
      max_tokens: 50,
      provider: {
        require_parameters: false,
        allow_fallbacks: false,
        data_collection: "deny",
      },
    } as any);

    console.log(
      "[API/GUESS] Full Response:",
      JSON.stringify(response, null, 2)
    );

    const guess = response.choices[0]?.message?.content?.trim();

    console.log("[API/GUESS] Raw AI response:", guess);

    if (!guess) {
      console.warn("[API/GUESS] Empty response, using category fallback");
      return generateFunnyGuess(request.category);
    }

    const koreanMatch = guess.match(/[가-힣]+/);
    console.log("[API/GUESS] Korean match:", koreanMatch);

    const finalGuess = koreanMatch ? koreanMatch[0] : guess;
    
    // If AI gave up and said "모르겠음", force a real guess from the category
    if (finalGuess === "모르겠음" || finalGuess === "모름" || finalGuess === "모르겠다") {
      console.warn("[API/GUESS] AI gave up, forcing category guess");
      return generateFunnyGuess(request.category);
    }

    return finalGuess;
  } catch (error) {
    console.error("Error generating guess:", error);
    return "통신오류";
  }
}

export { openrouter };
