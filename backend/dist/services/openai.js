"use strict";
/**
 * OpenAI API Service for Teams Assistant
 * Provides a reusable chat function for AI assistant capabilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = chat;
exports.buildContext = buildContext;
exports.createChannelAssistantPrompt = createChannelAssistantPrompt;
exports.isConfigured = isConfigured;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Chat with OpenAI's GPT model
 * @param systemPrompt - The system instruction for the AI
 * @param userMessage - The user's question or message
 * @param context - Optional context (messages and files) for RAG
 * @returns The assistant's text response
 */
async function chat(systemPrompt, userMessage, context) {
    try {
        // Build the messages array
        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
        ];
        // If context is provided, add it as a system message
        if (context) {
            messages.push({
                role: 'system',
                content: `Here is the relevant context from the channel:\n\n${context}`,
            });
        }
        // Add the user's message
        messages.push({
            role: 'user',
            content: userMessage,
        });
        console.log('🤖 Calling OpenAI API...');
        console.log(`   System prompt length: ${systemPrompt.length} chars`);
        console.log(`   Context length: ${context?.length || 0} chars`);
        console.log(`   User message: "${userMessage.substring(0, 100)}..."`);
        // Call the OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Use gpt-4o-mini for cost efficiency, can switch to gpt-3.5-turbo
            messages,
            max_tokens: 1000,
            temperature: 0.7,
        });
        // Extract the response
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }
        console.log('✅ OpenAI response received');
        console.log(`   Response length: ${response.length} chars`);
        return response;
    }
    catch (error) {
        console.error('❌ OpenAI API error:', error);
        // Handle specific OpenAI errors
        if (error instanceof openai_1.default.APIError) {
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
            }
            if (error.status === 429) {
                throw new Error('OpenAI rate limit exceeded. Please try again later.');
            }
            if (error.status === 500) {
                throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Build context string from messages and files for RAG
 * @param messages - Array of recent messages
 * @param files - Array of channel files
 * @param maxLength - Maximum context length (default 12000 chars)
 * @returns Formatted context string
 */
function buildContext(messages, files, users = [], maxLength = 12000) {
    let context = '';
    // Add user profiles first (helps identify team members)
    if (users.length > 0) {
        context += '=== USER PROFILES ===\n\n';
        for (const user of users) {
            context += `User: ${user.name} (${user.email})`;
            if (user.avatar) {
                context += `, Avatar: ${user.avatar}`;
            }
            context += '\n';
        }
        context += '\n';
    }
    // Add file contents first (they're usually more important for RAG)
    if (files.length > 0) {
        context += '=== UPLOADED FILES ===\n\n';
        for (const file of files) {
            // Truncate file content to first 500 chars
            const truncatedContent = file.content.length > 500
                ? file.content.substring(0, 500) + '...[truncated]'
                : file.content;
            context += `File: ${file.name}\nContent:\n${truncatedContent}\n\n`;
        }
    }
    // Add message history
    if (messages.length > 0) {
        context += '=== RECENT MESSAGES ===\n\n';
        for (const msg of messages) {
            const timestamp = new Date(msg.timestamp).toLocaleString();
            context += `[${timestamp}] ${msg.sender.name}: ${msg.content}\n`;
        }
    }
    // Truncate if necessary
    if (context.length > maxLength) {
        context = context.substring(0, maxLength) + '\n...[context truncated]';
    }
    return context;
}
/**
 * Create a system prompt for the channel assistant
 * @param channelName - Name of the channel
 * @returns System prompt string
 */
function createChannelAssistantPrompt(channelName) {
    return `You are an AI assistant in the "${channelName}" Teams channel. 
Your role is to help team members by answering questions based on the channel's context.

Guidelines:
- Answer questions using ONLY the provided channel messages, files, and user profiles
- If the answer is not in the context, politely say "I couldn't find information about that in the channel history or files"
- Be concise and helpful
- If referring to information from a file, mention the file name
- If referring to a previous message, mention who said it
- If referring to a user profile, mention the person's name and email
- Format your responses clearly using markdown when appropriate
- Be friendly and professional`;
}
/**
 * Check if OpenAI is configured
 * @returns true if API key is set
 */
function isConfigured() {
    return !!process.env.OPENAI_API_KEY;
}
//# sourceMappingURL=openai.js.map