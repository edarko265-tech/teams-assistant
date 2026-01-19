/**
 * OpenAI API Service for Teams Assistant
 * Provides a reusable chat function for AI assistant capabilities
 */
/**
 * Chat with OpenAI's GPT model
 * @param systemPrompt - The system instruction for the AI
 * @param userMessage - The user's question or message
 * @param context - Optional context (messages and files) for RAG
 * @returns The assistant's text response
 */
export declare function chat(systemPrompt: string, userMessage: string, context?: string): Promise<string>;
/**
 * Build context string from messages and files for RAG
 * @param messages - Array of recent messages
 * @param files - Array of channel files
 * @param maxLength - Maximum context length (default 12000 chars)
 * @returns Formatted context string
 */
export declare function buildContext(messages: Array<{
    sender: {
        name: string;
    };
    content: string;
    timestamp: Date;
}>, files: Array<{
    name: string;
    content: string;
}>, users?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
}>, maxLength?: number): string;
/**
 * Create a system prompt for the channel assistant
 * @param channelName - Name of the channel
 * @returns System prompt string
 */
export declare function createChannelAssistantPrompt(channelName: string): string;
/**
 * Check if OpenAI is configured
 * @returns true if API key is set
 */
export declare function isConfigured(): boolean;
//# sourceMappingURL=openai.d.ts.map