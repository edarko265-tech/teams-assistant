/**
 * Channels API Routes
 * Handles channel listing, details, and assistant toggle
 */

import { Router, Request, Response } from 'express';
import {
  getAllChannels,
  getChannel,
  toggleChannelAssistant,
} from '../services/storage';
import { ToggleAssistantRequest, ApiResponse, Channel } from '../types';

const router = Router();

/**
 * GET /api/channels
 * List all channels
 */
router.get('/', (_req: Request, res: Response<ApiResponse<Channel[]>>) => {
  try {
    const channels = getAllChannels();
    console.log(`📋 Fetched ${channels.length} channels`);
    res.json({ success: true, data: channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channels' });
  }
});

/**
 * GET /api/channels/:id
 * Get channel details by ID
 */
router.get('/:id', (req: Request, res: Response<ApiResponse<Channel>>) => {
  try {
    const { id } = req.params;
    const channel = getChannel(id);

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    console.log(`📋 Fetched channel: ${channel.name}`);
    res.json({ success: true, data: channel });
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channel' });
  }
});

/**
 * POST /api/channels/:id/toggle-assistant
 * Toggle AI assistant on/off for a channel
 * Body: { enabled: boolean }
 */
router.post(
  '/:id/toggle-assistant',
  (
    req: Request<{ id: string }, ApiResponse<Channel>, ToggleAssistantRequest>,
    res: Response<ApiResponse<Channel>>
  ) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request: "enabled" must be a boolean',
        });
      }

      const channel = toggleChannelAssistant(id, enabled);

      if (!channel) {
        return res.status(404).json({ success: false, error: 'Channel not found' });
      }

      console.log(
        `🤖 Assistant ${enabled ? 'enabled' : 'disabled'} for channel: ${channel.name}`
      );
      res.json({ success: true, data: channel });
    } catch (error) {
      console.error('Error toggling assistant:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle assistant' });
    }
  }
);

export default router;
