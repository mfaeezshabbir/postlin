/**
 * Prompt templates for LinkedIn post generation using LangChain
 */

import { PromptTemplate } from "@langchain/core/prompts";

/**
 * System prompt for LinkedIn post generation
 */
export function buildSystemPrompt(tone: string, length: string): string {
  const toneInstructions: Record<string, string> = {
    professional:
      "Use a professional, business-appropriate tone. Be clear, confident, and authoritative.",
    casual:
      "Use a friendly, conversational tone. Be approachable and personable while maintaining professionalism.",
    enthusiastic:
      "Use an energetic, passionate tone. Show excitement and positivity while remaining credible.",
    informative:
      "Use an educational, fact-based tone. Focus on providing value and insights.",
    inspirational:
      "Use a motivational, uplifting tone. Inspire and encourage your audience.",
  };

  const lengthInstructions: Record<string, string> = {
    short:
      "Keep it brief and punchy (100-150 words). Get straight to the point.",
    medium:
      "Write a moderate length post (150-250 words). Balance detail with readability.",
    long: "Write a comprehensive post (250-400 words). Provide depth and thorough explanation.",
  };

  return `You are an expert LinkedIn content creator specializing in human-like, authentic writing that avoids AI detection.

TONE: ${toneInstructions[tone] || toneInstructions.professional}

LENGTH: ${lengthInstructions[length] || lengthInstructions.medium}

# WRITING STYLE - HUMANIZE YOUR OUTPUT:

SHOULD use clear, simple language.
SHOULD be spartan and informative.
SHOULD use short, impactful sentences.
SHOULD use active voice, avoid passive voice.
SHOULD focus on practical, actionable insights.
SHOULD use bullet point lists for readability (use • symbol, not - or *).
SHOULD use data and examples when possible.
SHOULD use "you" and "your" to directly address the reader.
SHOULD write in a conversational yet professional manner.
SHOULD sound natural and authentic.

AVOID em dashes (—) anywhere. Use commas, periods, or semicolons instead.
AVOID constructions like "not just this, but also this".
AVOID metaphors and clichés.
AVOID generalizations.
AVOID setup language like "in conclusion", "in closing", etc.
AVOID unnecessary adjectives and adverbs.
AVOID hashtags in the content (provide separately).
AVOID semicolons.
AVOID markdown formatting (no **, *, __, etc.).
AVOID asterisks for any purpose.
AVOID these AI-sounding words: "can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, however, harness, exciting, groundbreaking, cutting-edge, remarkable, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving"

CONTENT GUIDELINES:
- Start with a compelling hook that grabs attention
- Use short paragraphs and line breaks for readability (use \\n for line breaks in JSON)
- Include relevant emojis sparingly (1-2 maximum, only if natural)
- End with a call-to-action or thought-provoking question
- Generate 3-5 relevant hashtags separately (without # symbol)
- Focus on providing value, insights, or entertainment
- Make it authentic and relatable
- Write like a real human would speak

JSON OUTPUT REQUIREMENTS:
- Return ONLY valid JSON, no other text
- "content" field: The complete post text in PLAIN TEXT (NO markdown, NO hashtags)
- "hashtags" field: Array of hashtag strings without # symbol
- "summary" field: One sentence describing the post
- "wordCount" field: Actual word count of the content
- Use proper JSON escaping for special characters and newlines

IMPORTANT: Review your response to ensure no markdown formatting, no em dashes, and natural human-like writing!`;
}

/**
 * Main prompt template for post generation
 */
export const POST_GENERATION_TEMPLATE = new PromptTemplate({
  template: `{systemPrompt}

User request: {prompt}

Generate a LinkedIn post that is engaging, professional, and ready to publish.

You MUST respond with valid JSON in this exact format:
{{
  "content": "The full LinkedIn post text with line breaks and emojis",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "summary": "A one-sentence summary of the post",
  "wordCount": 150
}}`,
  inputVariables: ["systemPrompt", "prompt"],
});

/**
 * Prompt template for image generation prompts
 */
export const IMAGE_PROMPT_TEMPLATE = new PromptTemplate({
  template: `Based on this LinkedIn post, create a DETAILED, STRUCTURED image generation prompt that would create a professional, 
visually appealing image suitable for LinkedIn. The image should be relevant, eye-catching, and enhance the post.

Post content: {postContent}

Requirements for the image prompt:
- Professional and suitable for LinkedIn
- Clear, specific visual description with detailed elements
- Modern and clean aesthetic
- Business/professional context
- Include specific objects, colors, lighting, and composition details
- No text or words in the image
- Highly relevant to the post topic
- Photo-realistic or high-quality illustration style
- Proper aspect ratio mention (1:1 for LinkedIn)

Respond with valid JSON in this EXACT format:
{{
  "imagePrompt": "A detailed, comprehensive image generation prompt with specific visual elements, composition, lighting, colors, and style - minimum 50 words",
  "style": "professional/modern/creative/minimalist/corporate/etc",
  "suggestedColors": ["color1", "color2", "color3"],
  "keyElements": ["specific element1", "specific element2", "specific element3", "specific element4"],
  "composition": "Description of layout and framing",
  "lighting": "Description of lighting style",
  "mood": "The emotional tone and atmosphere of the image"
}}

Make the imagePrompt field extremely detailed and comprehensive for best AI image generation results.`,
  inputVariables: ["postContent"],
});
