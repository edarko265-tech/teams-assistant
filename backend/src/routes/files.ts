/**
 * Files API Routes
 * Handles file upload and retrieval for channels
 */

import { Router, Request, Response } from 'express';
import {
  getFilesForChannel,
  addFile,
  getUser,
  getChannel,
  generateId,
} from '../services/storage';
import { UploadedFile, UploadFileRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /api/files/:channelId
 * Get all files in a channel
 */
router.get(
  '/:channelId',
  (req: Request, res: Response<ApiResponse<UploadedFile[]>>) => {
    try {
      const { channelId } = req.params;

      // Verify channel exists
      const channel = getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      const files = getFilesForChannel(channelId);
      console.log(`📁 Fetched ${files.length} files for channel: ${channel.name}`);
      res.json({ success: true, data: files });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch files' });
    }
  }
);

/**
 * POST /api/files/:channelId
 * Upload a file to a channel
 * Body: { name: string, content: string, userId: string }
 */
router.post(
  '/:channelId',
  (
    req: Request<{ channelId: string }, ApiResponse<UploadedFile>, UploadFileRequest>,
    res: Response<ApiResponse<UploadedFile>>
  ) => {
    try {
      const { channelId } = req.params;
      const { name, content, userId } = req.body;

      // Validate request
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'File name is required',
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'File content is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      // Verify channel exists
      const channel = getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      // Get the uploader
      const uploader = getUser(userId);
      if (!uploader) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Validate file extension (only allow text files for demo)
      const allowedExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.yaml', '.yml'];
      const fileExtension = name.substring(name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
        });
      }

      // Create the file
      const file: UploadedFile = {
        id: generateId('file'),
        name: name.trim(),
        size: content.length,
        uploadedBy: uploader,
        uploadedAt: new Date(),
        content,
        channelId,
      };

      // Save the file
      addFile(file);

      console.log(
        `📤 File uploaded by ${uploader.name} to ${channel.name}: ${file.name} (${file.size} bytes)`
      );
      res.status(201).json({ success: true, data: file });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
  }
);

/**
 * GET /api/files/:channelId/:fileId
 * Get a specific file's content
 */
router.get(
  '/:channelId/:fileId',
  (req: Request, res: Response<ApiResponse<UploadedFile>>) => {
    try {
      const { channelId, fileId } = req.params;

      // Verify channel exists
      const channel = getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      // Find the file
      const files = getFilesForChannel(channelId);
      const file = files.find((f) => f.id === fileId);

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      console.log(`📁 Fetched file: ${file.name}`);
      res.json({ success: true, data: file });
    } catch (error) {
      console.error('Error fetching file:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch file' });
    }
  }
);

export default router;
