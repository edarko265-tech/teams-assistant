"use strict";
/**
 * Files API Routes
 * Handles file upload and retrieval for channels
 * Supports: text files, PDFs, images, and archives (ZIP)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const supabase_1 = require("../services/supabase");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (_req, file, cb) => {
        const mimeType = file.mimetype;
        if (types_1.SUPPORTED_MIME_TYPES[mimeType]) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
    },
});
/**
 * Get file category from MIME type
 */
function getFileCategory(mimeType) {
    const typeInfo = types_1.SUPPORTED_MIME_TYPES[mimeType];
    return typeInfo?.category || 'unknown';
}
/**
 * Check if file content should be stored (text files only)
 */
function shouldStoreContent(mimeType) {
    const category = getFileCategory(mimeType);
    return category === 'text';
}
/**
 * GET /api/files/:channelId
 * Get all files in a channel
 */
router.get('/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        // Verify channel exists
        const channel = await (0, supabase_1.getChannel)(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                error: 'Channel not found',
            });
        }
        const files = await (0, supabase_1.getFilesForChannel)(channelId);
        console.log(`📁 Fetched ${files.length} files for channel: ${channel.name}`);
        res.json({ success: true, data: files });
    }
    catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch files' });
    }
});
/**
 * POST /api/files/:channelId
 * Upload a file to a channel (multipart form data)
 */
router.post('/:channelId', upload.single('file'), async (req, res) => {
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
        const channel = await (0, supabase_1.getChannel)(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                error: 'Channel not found',
            });
        }
        // Get the uploader
        const uploader = await (0, supabase_1.getUser)(userId);
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
        const fileExtension = path_1.default.extname(fileName);
        const storagePath = `${channelId}/${(0, uuid_1.v4)()}${fileExtension}`;
        // For text files, extract content for AI context
        let content;
        if (shouldStoreContent(mimeType)) {
            content = uploadedFile.buffer.toString('utf-8');
        }
        // Save file to local storage (or Supabase Storage if configured)
        const localPath = path_1.default.join(uploadsDir, storagePath);
        const localDir = path_1.default.dirname(localPath);
        if (!fs_1.default.existsSync(localDir)) {
            fs_1.default.mkdirSync(localDir, { recursive: true });
        }
        fs_1.default.writeFileSync(localPath, uploadedFile.buffer);
        // Also try to upload to Supabase Storage
        try {
            await (0, supabase_1.uploadFileToStorage)('channel-files', storagePath, uploadedFile.buffer, mimeType);
        }
        catch (storageError) {
            console.warn('Supabase storage upload failed, using local storage:', storageError);
        }
        // Create file record in database
        const file = await (0, supabase_1.addFile)(fileName, fileSize, mimeType, storagePath, content, userId, channelId);
        if (!file) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save file record',
            });
        }
        console.log(`📤 File uploaded by ${uploader.name} to ${channel.name}: ${fileName} (${fileSize} bytes, ${mimeType})`);
        res.status(201).json({ success: true, data: file });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        if (error.message?.includes('Unsupported file type')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
});
/**
 * Handle text file upload via JSON body (backwards compatibility)
 */
async function handleTextFileUpload(req, res, channelId) {
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
    const channel = await (0, supabase_1.getChannel)(channelId);
    if (!channel) {
        return res.status(404).json({
            success: false,
            error: 'Channel not found',
        });
    }
    // Get the uploader
    const uploader = await (0, supabase_1.getUser)(userId);
    if (!uploader) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }
    // Determine MIME type from extension
    const ext = path_1.default.extname(name).toLowerCase();
    const mimeTypeMap = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.csv': 'text/csv',
        '.xml': 'application/xml',
        '.yaml': 'text/yaml',
        '.yml': 'text/yaml',
    };
    const mimeType = mimeTypeMap[ext] || 'text/plain';
    const storagePath = `${channelId}/${(0, uuid_1.v4)()}${ext}`;
    // Create file record
    const file = await (0, supabase_1.addFile)(name.trim(), content.length, mimeType, storagePath, content, userId, channelId);
    if (!file) {
        return res.status(500).json({
            success: false,
            error: 'Failed to save file',
        });
    }
    console.log(`📤 Text file uploaded by ${uploader.name} to ${channel.name}: ${file.name} (${file.size} bytes)`);
    res.status(201).json({ success: true, data: file });
}
/**
 * GET /api/files/:channelId/:fileId
 * Get a specific file's metadata and content
 */
router.get('/:channelId/:fileId', async (req, res) => {
    try {
        const { channelId, fileId } = req.params;
        // Verify channel exists
        const channel = await (0, supabase_1.getChannel)(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                error: 'Channel not found',
            });
        }
        // Get file
        const file = await (0, supabase_1.getFile)(fileId);
        if (!file || file.channelId !== channelId) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
            });
        }
        console.log(`📁 Fetched file: ${file.name}`);
        res.json({ success: true, data: file });
    }
    catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch file' });
    }
});
/**
 * GET /api/files/:channelId/:fileId/download
 * Download a file
 */
router.get('/:channelId/:fileId/download', async (req, res) => {
    try {
        const { channelId, fileId } = req.params;
        const file = await (0, supabase_1.getFile)(fileId);
        if (!file || file.channelId !== channelId) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
            });
        }
        // Try to get from local storage first
        const localPath = path_1.default.join(uploadsDir, file.storagePath);
        if (fs_1.default.existsSync(localPath)) {
            res.setHeader('Content-Type', file.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            return res.sendFile(localPath);
        }
        // Try to get URL from Supabase Storage
        const url = await (0, supabase_1.getFileUrl)('channel-files', file.storagePath);
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
    }
    catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ success: false, error: 'Failed to download file' });
    }
});
exports.default = router;
//# sourceMappingURL=files.js.map