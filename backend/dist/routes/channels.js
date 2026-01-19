"use strict";
/**
 * Channels API Routes
 * Handles channel listing, details, and assistant toggle
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../services/supabase");
const router = (0, express_1.Router)();
/**
 * GET /api/channels
 * List all channels
 */
router.get('/', async (_req, res) => {
    try {
        const channels = await (0, supabase_1.getAllChannels)();
        console.log(`📋 Fetched ${channels.length} channels`);
        res.json({ success: true, data: channels });
    }
    catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch channels' });
    }
});
/**
 * GET /api/channels/:id
 * Get channel details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const channel = await (0, supabase_1.getChannel)(id);
        if (!channel) {
            return res.status(404).json({ success: false, error: 'Channel not found' });
        }
        console.log(`📋 Fetched channel: ${channel.name}`);
        res.json({ success: true, data: channel });
    }
    catch (error) {
        console.error('Error fetching channel:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch channel' });
    }
});
/**
 * POST /api/channels
 * Create a new channel
 * Body: { name: string, description: string, userId: string }
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, userId } = req.body;
        if (!name || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Name and userId are required',
            });
        }
        const channel = await (0, supabase_1.createChannel)(name, description || '', userId);
        if (!channel) {
            return res.status(500).json({ success: false, error: 'Failed to create channel' });
        }
        console.log(`📋 Created channel: ${channel.name}`);
        res.json({ success: true, data: channel });
    }
    catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ success: false, error: 'Failed to create channel' });
    }
});
/**
 * POST /api/channels/:id/join
 * Join a channel
 * Body: { userId: string }
 */
router.post('/:id/join', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }
        const success = await (0, supabase_1.addChannelMember)(id, userId);
        if (!success) {
            return res.status(500).json({ success: false, error: 'Failed to join channel' });
        }
        const channel = await (0, supabase_1.getChannel)(id);
        console.log(`👤 User joined channel: ${channel?.name}`);
        res.json({ success: true, data: channel });
    }
    catch (error) {
        console.error('Error joining channel:', error);
        res.status(500).json({ success: false, error: 'Failed to join channel' });
    }
});
/**
 * POST /api/channels/:id/toggle-assistant
 * Toggle AI assistant on/off for a channel
 * Body: { enabled: boolean }
 */
router.post('/:id/toggle-assistant', async (req, res) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: "enabled" must be a boolean',
            });
        }
        const channel = await (0, supabase_1.updateChannelAssistant)(id, enabled);
        if (!channel) {
            return res.status(404).json({ success: false, error: 'Channel not found' });
        }
        console.log(`🤖 Assistant ${enabled ? 'enabled' : 'disabled'} for channel: ${channel.name}`);
        res.json({ success: true, data: channel });
    }
    catch (error) {
        console.error('Error toggling assistant:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle assistant' });
    }
});
exports.default = router;
//# sourceMappingURL=channels.js.map