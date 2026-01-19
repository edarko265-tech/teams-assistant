/**
 * Files API Routes
 * Handles file upload and retrieval for channels
 * Supports: text files, PDFs, images, and archives (ZIP)
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  getFilesForChannel,
  addFile,
  getFile,
  getUser,
  getChannel,
  uploadFileToStorage,
  getFileUrl,
} from '../services/supabase';
import { UploadedFile, ApiResponse, SUPPORTED_MIME_TYPES, SupportedMimeType } from '../types';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    const mimeType = file.mimetype as SupportedMimeType;
    if (SUPPORTED_MIME_TYPES[mimeType]) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * Get file category from MIME type
 */
function getFileCategory(mimeType: string): string {
  const typeInfo = SUPPORTED_MIME_TYPES[mimeType as SupportedMimeType];
  return typeInfo?.category || 'unknown';
}

/**
 * Check if file content should be stored (text files only)
 */
function shouldStoreContent(mimeType: string): boolean {
  const category = getFileCategory(mimeType);
  return category === 'text';
}

/**
 * GET /api/files/:channelId
 * Get all files in a channel
 */
router.get(
  '/:channelId',
  async (req: Request, res: Response<ApiResponse<UploadedFile[]>>) => {
    try {
      const { channelId } = req.params;

      // Verify channel exists
      const channel = await getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      const files = await getFilesForChannel(channelId);
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
 * Upload a file to a channel (multipart form data)
 */
router.post(
  '/:channelId',
  upload.single('file'),
  async (req: Request, res: Response<ApiResponse<UploadedFile>>) => {
    try {
      const { channelId } = req.params;
      const userId = req.body.userId;
      const uploadedFile = req.file;

      // Handle JSON body for text content (backwards compatibility)
      if (!uploadedFile && req.body.name && req.body.content) {
        return handleTextFileUpload(req, res, channelId);
      }

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      // Verify channel exists
      const channel = await getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      // Get the uploader
      const uploader = await getUser(userId);
      if (!uploader) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const mimeType = uploadedFile.mimetype;
      const fileName = uploadedFile.originalname;
      const fileSize = uploadedFile.size;
      
      // Generate unique storage path
      const fileExtension = path.extname(fileName);
      const storagePath = `${channelId}/${uuidv4()}${fileExtension}`;

      // For text files, extract content for AI context
      let content: string | undefined;
      if (shouldStoreContent(mimeType)) {
        content = uploadedFile.buffer.toString('utf-8');
      }

      // Save file to local storage (or Supabase Storage if configured)
      const localPath = path.join(uploadsDir, storagePath);
      const localDir = path.dirname(localPath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(localPath, uploadedFile.buffer);

      // Also try to upload to Supabase Storage
      try {
        await uploadFileToStorage('channel-files', storagePath, uploadedFile.buffer, mimeType);
      } catch (storageError) {
        console.warn('Supabase storage upload failed, using local storage:', storageError);
      }

      // Create file record in database
      const file = await addFile(
        fileName,
        fileSize,
        mimeType,
        storagePath,
        content,
        userId,
        channelId
      );

      if (!file) {
        return res.status(500).json({
          success: false,
          error: 'Failed to save file record',
        });
      }

      console.log(
        `📤 File uploaded by ${uploader.name} to ${channel.name}: ${fileName} (${fileSize} bytes, ${mimeType})`
      );
      res.status(201).json({ success: true, data: file });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      if (error.message?.includes('Unsupported file type')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
  }
);

/**
 * Handle text file upload via JSON body (backwards compatibility)
 */
async function handleTextFileUpload(
  req: Request,
  res: Response<ApiResponse<UploadedFile>>,
  channelId: string
) {
  const { name, content, userId } = req.body;

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
  const channel = await getChannel(channelId);
  if (!channel) {
    return res.status(404).json({
      success: false,
      error: 'Channel not found',
    });
  }

  // Get the uploader
  const uploader = await getUser(userId);
  if (!uploader) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Determine MIME type from extension
  const ext = path.extname(name).toLowerCase();
  const mimeTypeMap: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.xml': 'application/xml',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
  };

  const mimeType = mimeTypeMap[ext] || 'text/plain';
  const storagePath = `${channelId}/${uuidv4()}${ext}`;

  // Create file record
  const file = await addFile(
    name.trim(),
    content.length,
    mimeType,
    storagePath,
    content,
    userId,
    channelId
  );

  if (!file) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save file',
    });
  }

  console.log(
    `📤 Text file uploaded by ${uploader.name} to ${channel.name}: ${file.name} (${file.size} bytes)`
  );
  res.status(201).json({ success: true, data: file });
}

/**
 * GET /api/files/:channelId/:fileId
 * Get a specific file's metadata and content
 */
router.get(
  '/:channelId/:fileId',
  async (req: Request, res: Response<ApiResponse<UploadedFile>>) => {
    try {
      const { channelId, fileId } = req.params;

      // Verify channel exists
      const channel = await getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found',
        });
      }

      // Get file
      const file = await getFile(fileId);

      if (!file || file.channelId !== channelId) {
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

/**
 * GET /api/files/:channelId/:fileId/download
 * Download a file
 */
router.get(
  '/:channelId/:fileId/download',
  async (req: Request, res: Response) => {
    try {
      const { channelId, fileId } = req.params;

      const file = await getFile(fileId);
      if (!file || file.channelId !== channelId) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      // Try to get from local storage first
      const localPath = path.join(uploadsDir, file.storagePath);
      if (fs.existsSync(localPath)) {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        return res.sendFile(localPath);
      }

      // Try to get URL from Supabase Storage
      const url = await getFileUrl('channel-files', file.storagePath);
      if (url) {
        return res.redirect(url);
      }

      // If content is stored in DB (text files), return it
      if (file.content) {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        return res.send(file.content);
      }

      return res.status(404).json({
        success: false,
        error: 'File content not available',
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ success: false, error: 'Failed to download file' });
    }
  }
);

export default router;
