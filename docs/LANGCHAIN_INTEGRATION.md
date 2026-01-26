# LangChain.js Integration

## Overview

Postlin now uses [LangChain.js](https://js.langchain.com/) for AI-powered content generation. LangChain provides a modular, extensible framework for building advanced AI workflows with support for multiple LLM providers.

## Architecture

### Modular Structure

The LangChain integration is organized in `modules/langchain/` with the following components:

```
modules/langchain/
├── index.ts              # Main orchestration layer (entry point)
├── types.ts              # TypeScript interfaces and types
├── prompts.ts            # Prompt templates for post generation
├── factory.ts            # Provider factory and user provider lookup
└── providers/
    ├── base.ts           # Abstract base provider class
    └── gemini.ts         # Gemini provider implementation
```

### Key Components

#### 1. Provider System

**Base Provider (`providers/base.ts`)**
- Abstract class defining the interface for AI providers
- Methods: `generatePost()`, `generateImagePrompt()`, `validateApiKey()`
- Extensible design for adding new providers (OpenAI, HuggingFace, etc.)

**Gemini Provider (`providers/gemini.ts`)**
- Implements the base provider for Google's Gemini models
- Uses LangChain's `ChatGoogleGenerativeAI` wrapper
- Supports all Gemini models (2.5 Flash, 1.5 Flash, 1.5 Pro, etc.)

#### 2. Prompt Templates

**Post Generation Template**
- Structured prompt for creating LinkedIn posts
- Includes tone and length customization
- Guidelines for human-like, authentic writing
- JSON output format for structured responses

**Image Prompt Template**
- Generates detailed prompts for image generation
- Includes style, composition, lighting, and mood specifications
- Returns structured metadata for image creation

#### 3. Factory Pattern

The factory (`factory.ts`) handles:
- User-specific provider creation based on database config
- API key retrieval and decryption
- Provider selection (currently Gemini, extendable to others)

#### 4. Orchestration Layer

The main module (`index.ts`) provides high-level functions:
- `generateLinkedInPost()` - Generate a complete LinkedIn post
- `generateImagePromptForPost()` - Create image generation prompts
- `validateUserApiKey()` - Validate user's API credentials

## Usage

### Basic Post Generation

```typescript
import { generateLinkedInPost } from '@/modules/langchain';

const result = await generateLinkedInPost(userId, {
  prompt: "Write about the future of AI in business",
  tone: "professional",
  length: "medium"
});

console.log(result.content);     // Generated post text
console.log(result.hashtags);    // Suggested hashtags
console.log(result.summary);     // One-line summary
console.log(result.wordCount);   // Word count
```

### Image Prompt Generation

```typescript
import { generateImagePromptForPost } from '@/modules/langchain';

const imagePrompt = await generateImagePromptForPost(
  userId,
  "Your LinkedIn post content here"
);

console.log(imagePrompt.imagePrompt);      // Detailed prompt text
console.log(imagePrompt.style);            // Image style
console.log(imagePrompt.suggestedColors);  // Color palette
console.log(imagePrompt.keyElements);      // Visual elements
```

### API Key Validation

```typescript
import { validateUserApiKey } from '@/modules/langchain';

const isValid = await validateUserApiKey(userId);
if (!isValid) {
  console.error("Invalid or missing API key");
}
```

## Supported Providers

### Current: Gemini

- **Models**: gemini-2.5-flash (default), gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp
- **Features**: Text generation, JSON mode, structured outputs
- **API Key**: User-provided, stored encrypted (AES-256-GCM)

### Future: Coming Soon

- **OpenAI** - GPT-4, GPT-3.5-turbo
- **HuggingFace** - Open-source models
- **Featherless** - Cost-effective alternatives
- **Custom endpoints** - Self-hosted models

## Adding New Providers

To add a new AI provider:

1. **Create Provider Class** (`providers/yourprovider.ts`)
   ```typescript
   import { AIProvider } from "./base";
   import { ChatYourProvider } from "@langchain/yourprovider";
   
   export class YourProvider extends AIProvider {
     private chatModel: ChatYourProvider;
     
     constructor(config: AIProviderConfig) {
       super(config);
       this.chatModel = new ChatYourProvider({
         apiKey: config.apiKey,
         model: config.model || "default-model"
       });
     }
     
     // Implement abstract methods...
   }
   ```

2. **Update Factory** (`factory.ts`)
   ```typescript
   import { YourProvider } from "./providers/yourprovider";
   
   export function createProvider(config: AIProviderConfig): AIProvider {
     switch (config.provider) {
       case "gemini":
         return new GeminiProvider(config);
       case "yourprovider":
         return new YourProvider(config);
       // ...
     }
   }
   ```

3. **Update Types** (`types.ts`)
   ```typescript
   export type AIProvider = "gemini" | "openai" | "yourprovider";
   ```

4. **Update Database Schema** (if needed)
   - Add provider-specific fields to User model
   - Add encrypted API key storage for the new provider

## Security

### API Key Management

- **Encryption**: All API keys are encrypted with AES-256-GCM
- **Storage**: Encrypted keys stored in MongoDB
- **Scope**: Each user has their own API keys (not shared)
- **Transmission**: Keys never logged or transmitted in plaintext

### Rate Limiting

- Implement application-level rate limiting for API calls
- User-specific quotas based on their API provider limits
- Graceful error handling for quota exceeded scenarios

### Error Handling

The integration includes comprehensive error handling:
- API key validation errors
- Model not found errors
- Quota/rate limit errors
- Network/timeout errors
- Invalid response format errors

## Testing

Tests are located in `__tests__/langchain.test.ts` and cover:
- Provider factory creation
- Post generation with different tones and lengths
- Image prompt generation
- API key validation
- Error scenarios and edge cases

Run tests:
```bash
npm test langchain.test.ts
```

## Benefits of LangChain

1. **Modularity**: Easy to swap providers or add new ones
2. **Standardization**: Consistent interface across different LLMs
3. **Advanced Features**: Support for chains, agents, and RAG (future)
4. **Type Safety**: Full TypeScript support with proper typing
5. **Observability**: Built-in logging and debugging support
6. **Extensibility**: Ready for future features like:
   - Multi-step content workflows (draft → optimize → finalize)
   - Retrieval-augmented generation (RAG)
   - Custom chains for specific use cases
   - Tool calling and external integrations

## Migration Notes

The new LangChain-based implementation:
- ✅ Maintains backward compatibility with existing API
- ✅ Preserves all existing features (tone, length, image generation)
- ✅ Uses the same database schema and API endpoints
- ✅ Includes a flag `usedLangChain: true` in API responses for tracking

No frontend changes are required - the integration is transparent to the UI.

## Future Roadmap

### Phase 1: Multi-Provider Support (Current)
- ✅ Gemini provider with LangChain
- ⏳ OpenAI provider
- ⏳ HuggingFace provider
- ⏳ Provider selection in UI

### Phase 2: Advanced Workflows
- Multi-step content generation (chains)
- Content optimization and refinement
- A/B testing of different prompts
- Fallback mechanisms between providers

### Phase 3: Personalization
- RAG using user's previous posts
- Custom prompt templates per user
- Analytics-driven content suggestions
- Learning from engagement metrics

### Phase 4: Advanced Features
- Tool calling for external data
- Scheduled batch generation
- Multi-language support
- Custom fine-tuned models

## References

- [LangChain.js Documentation](https://js.langchain.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Postlin Architecture Guide](./ARCHITECTURE.md)
