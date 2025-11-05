
// This file should be placed in your backend/serverless function directory.
// For example, in a Next.js project, this would be `pages/api/generate.ts`.
// In a standalone Node.js server, this logic would be part of a route handler.

const API_KEY = process.env.API_KEY;
const API_URL = (process.env.API_URL || 'https://api.openai.com').replace(/\/$/, '');

if (!API_KEY) {
  console.warn("API_KEY environment variable not set on the server");
}

const PROMPT_ZH = `
Your core mission is to convert any input text (like scripts or articles) into pure, rhythm-focused "plain text subtitles". You must strictly follow all steps and principles to produce the required format.

**Golden Rule: Do not delete or modify any single Chinese character, letter, or number from the original text.** All optimizations must be achieved ONLY through line breaks, space handling, and symbol cleaning.

---

## Step 1: Preprocessing (Mandatory)

### 1. Mandatory Sensitive Word Replacement
You must strictly replace words according to the following mapping and order. This is the highest priority replacement rule.
1.  "婚外情" → "婚W情"
2.  "私生子" → "S生子"
3.  "出轨" → "出G"
4.  "小三" → "小S"
Note: Follow this exact order. Only replace full, exact matches to avoid errors.

### 2. Text Sanitization
- **Symbol Cleaning**: Delete all punctuation (e.g., \`，。？！、；：“”《》【】（）\`), special symbols (e.g., \`·~@#$%^&*\`), and Emojis.
    - **Sole Exception**: The percent sign \`%\` MUST be preserved.
- **Space Normalization**:
    1.  Replace all full-width spaces \`　\` with a single half-width space \` \`.
    2.  Collapse any sequence of multiple half-width spaces into a single one.
    3.  Trim all leading and trailing spaces from every line.
- **Empty Line Removal**: Delete all empty lines.

---

## Step 2: Line Splitting (Core Algorithm)

### A. Core Philosophy: Rhythm First, Length Second
The final goal is to simulate natural speech pauses and create visual rhythm. Line length is a tool to achieve this, but you must NEVER break the semantic integrity or natural rhythm of a sentence just to meet a character count.

### B. Hierarchy of Splitting Rules

#### **Layer 1: Absolute Rules**

1.  **Space Forces Newline**: After preprocessing, every remaining half-width space MUST be treated as a mandatory line break.
    - **Example**: \`看懂了 你才能破局\` becomes:
      \`\`\`
      看懂了
      你才能破局
      \`\`\`

2.  **Long Line Split (>10 chars)**: Any line with more than 10 Chinese characters MUST be split.
    - **Execution**: Find the most suitable breakpoint using the "Breakpoint Selection Priority List" below.
    - **Recursive Principle**: If any resulting part STILL has more than 10 Chinese characters, you MUST repeat the splitting process on that part until all final lines have 10 or fewer Chinese characters. This is crucial for readability.

#### **Layer 2: Preservation Rules**

1.  **Short Sentence Protection (≤6 chars)**: A complete, meaningful short sentence with 6 or fewer Chinese characters should, in principle, NOT be split further. This preserves its impact.
    - **Examples**: \`姐妹们\`, \`大错特错\`, \`你听着\`, \`为什么\` should remain as single lines.

2.  **Semantic Unit Protection**: Make every effort to keep recognized proper nouns, technical terms, or tight collocations (e.g., \`利益共同体\`, \`情感绑架\`, \`温水煮青蛙\`) on the same line, UNLESS doing so violates the "Long Line Split" rule.

#### **Layer 3: Methodology**

##### C. Breakpoint Selection Priority List
When you need to split a long sentence, you MUST follow this priority order to find the best breakpoint:

1.  **After strong logical/transitional words**: such as \`因为\` (because), \`所以\` (so), \`但是\` (but), \`而且\` (and), \`如果\` (if), \`那么\` (then). This is the most natural pausing point.
2.  **Within parallel/progressive/alternative structures**: Before or after words like \`以及\` (as well as), \`和\` (and), \`与\` (with), \`或\` (or), \`还\` (also), \`也\` (also), or between parallel phrases.
    - **Example**: \`买包 旅游 进修\` should be split into three separate lines.
3.  **At functional phrase boundaries**: After an adverbial phrase of purpose, reason, manner, or place.
    - **Example**: \`为了给你更好的体验 我们升级了系统\` → break after \`体验\`.
4.  **Between core grammatical structures**: Find the least disruptive split point, such as between the subject and predicate, or verb and object.
    - **Example**: \`这场博弈已经超越了感情的范畴\` → break after \`博弈\` or \`超越了\`.
5.  **After rhythmic particles/adverbs (as a last resort)**: For fine-tuning, you can break after words that create a slight pause, like \`的\`, \`了\`, \`着\`, \`就\`, \`才\`, \`都\`, \`正\`, \`在\`.

---

## Step 3: Final Output Format

- **Absolutely Pure**: Output ONLY the processed plain text subtitles. Do NOT include the original text, any explanations, comments, or markdown code blocks (like \`\`\`).
- **Single Separator**: Use ONLY a newline character to separate each subtitle line.
- **No Punctuation**: Ensure the final output contains no punctuation marks (except for \`%\`).
- **No Empty Lines**: Ensure there are no empty lines between the output lines.
- **Simplified Chinese**: Ensure all output characters are Simplified Chinese.

Now, process the following text:
`;

const PROMPT_EN = `
Your core mission is to convert any input text (like scripts or articles) into pure, rhythm-focused "plain text subtitles". You must strictly follow all steps and principles to produce the required format.

**Golden Rule: Do not delete or modify any single letter, or number from the original text.** All optimizations must be achieved ONLY through line breaks and symbol cleaning.

---

## Step 1: Preprocessing (Mandatory)

### Text Sanitization
- **Symbol Cleaning**: Delete all punctuation (e.g., \`.,?!;:""''()[]{}\`), special symbols (e.g., \`·~@#$%^&*\`), and Emojis.
    - **Sole Exception**: The percent sign \`%\` MUST be preserved.
- **Space Normalization**:
    1.  Collapse any sequence of multiple spaces into a single one.
    2.  Trim all leading and trailing spaces from every line.
- **Empty Line Removal**: Delete all empty lines.

---

## Step 2: Line Splitting (Core Algorithm)

### A. Core Philosophy: Rhythm First, Length Second
The final goal is to simulate natural speech pauses and create visual rhythm. Line length is a tool to achieve this, but you must NEVER break the semantic integrity or natural rhythm of a sentence just to meet a word count.

### B. Hierarchy of Splitting Rules

1.  **Natural Pauses**: Identify natural breakpoints in sentences. These often occur at commas, conjunctions (and, but, or), or between clauses. The goal is to create lines that a person could speak in a single breath.

2.  **Line Length Guideline (approx. 5-10 words)**: Aim for lines that are roughly 5 to 10 words long. This is a guideline, not a strict rule. A very short, impactful sentence (e.g., "I know.") should remain on its own line. A longer clause might be split logically.

3.  **Semantic Unit Protection**: Keep closely related words and phrases together (e.g., "artificial intelligence", "state-of-the-art"). Do not split them across lines unless absolutely necessary to avoid a very long line.

---

## Step 3: Final Output Format

- **Absolutely Pure**: Output ONLY the processed plain text subtitles. Do NOT include the original text, any explanations, comments, or markdown code blocks (like \`\`\`).
- **Single Separator**: Use ONLY a newline character to separate each subtitle line.
- **No Punctuation**: Ensure the final output contains no punctuation marks (except for \`%\`).
- **No Empty Lines**: Ensure there are no empty lines between the output lines.

Now, process the following text:
`;

const CHAT_COMPLETION_PATH = '/v1/chat/completions';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!API_KEY) {
    return new Response('API_KEY environment variable not set on the server', { status: 500 });
  }

  try {
    const { text, lang, model } = await req.json();

    if (!text || (lang !== 'en' && lang !== 'zh') || !model) {
      return new Response('Invalid request body. "text", "lang", and "model" are required.', { status: 400 });
    }

    const systemInstruction = lang === 'zh' ? PROMPT_ZH : PROMPT_EN;
    const response = await fetch(`${API_URL}${CHAT_COMPLETION_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Server Error: ${response.status} ${response.statusText} - ${errorText}`, { status: 500 });
    }

    if (!response.body) {
      return new Response('Upstream response body was empty.', { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              controller.enqueue(value);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });

  } catch (error) {
    console.error("Error in server-side API call:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred on the server.";
    return new Response(`Server Error: ${errorMessage}`, { status: 500 });
  }
}
