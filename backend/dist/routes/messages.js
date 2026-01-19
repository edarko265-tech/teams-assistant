"use strict";
/**
 * Messages API Routes
 * Handles message retrieval and sending for channels and chats
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../services/supabase");
const router = (0, express_1.Router)();
/**
 * GET /api/messages/:channelOrChatId
 * Get all messages for a channel or chat
 */
router.get('/:channelOrChatId', async (req, res) => {
    try {
        const { channelOrChatId } = req.params;
        // Check if it's a channel or chat by looking up in DB
        const channel = await (0, supabase_1.getChannel)(channelOrChatId);
        const chat = channel ? null : await (0, supabase_1.getChat)(channelOrChatId);
        let messages;
        if (channel) {
            messages = await (0, supabase_1.getMessagesForChannel)(channelOrChatId);
        }
        else if (chat) {
            messages = await (0, supabase_1.getMessagesForChat)(channelOrChatId);
        }
        else {
            return res.status(404).json({
                success: false,
                error: 'Channel or chat not found',
            });
        }
        console.log(`📨 Fetched ${messages.length} messages for: ${channelOrChatId}`);
        res.json({ success: true, data: messages });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});
/**
 * POST /api/messages/:channelOrChatId
 * Send a new message to a channel or chat
 * Body: { content: string, userId: string }
 */
router.post('/:channelOrChatId', async (req, res) => {
    try {
        const { channelOrChatId } = req.params;
        const { content, userId } = req.body;
        // Validate request
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message content is required',
            });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required',
            });
        }
        // Get the sender
        const sender = await (0, supabase_1.getUser)(userId);
        if (!sender) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        // Check if it's a channel or chat
        const channel = await (0, supabase_1.getChannel)(channelOrChatId);
        const chat = channel ? null : await (0, supabase_1.getChat)(channelOrChatId);
        if (!channel && !chat) {
            return res.status(404).json({
                success: false,
                error: 'Channel or chat not found',
            });
        }
        // Create the message
        const message = await (0, supabase_1.addMessage)(content.trim(), userId, {
            channelId: channel ? channelOrChatId : undefined,
            chatId: chat ? channelOrChatId : undefined,
            isAssistant: false,
        });
        if (!message) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create message',
            });
        }
        console.log(`📤 New message from ${sender.name} in ${channelOrChatId}: "${content.substring(0, 50)}..."`);
        res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map