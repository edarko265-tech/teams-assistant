"use strict";
/**
 * TypeScript interfaces for Teams Assistant
 * These define the shape of all data models used in the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_MIME_TYPES = void 0;
/**
 * Supported file MIME types
 */
exports.SUPPORTED_MIME_TYPES = {
    // Text files (content stored in DB for AI context)
    'text/plain': { extension: '.txt', category: 'text' },
    'text/markdown': { extension: '.md', category: 'text' },
    'application/json': { extension: '.json', category: 'text' },
    'text/csv': { extension: '.csv', category: 'text' },
    'application/xml': { extension: '.xml', category: 'text' },
    'text/xml': { extension: '.xml', category: 'text' },
    'text/yaml': { extension: '.yaml', category: 'text' },
    'application/x-yaml': { extension: '.yml', category: 'text' },
    // PDFs (stored in storage, content extracted if possible)
    'application/pdf': { extension: '.pdf', category: 'document' },
    // Images (stored in storage only)
    'image/jpeg': { extension: '.jpg', category: 'image' },
    'image/png': { extension: '.png', category: 'image' },
    'image/gif': { extension: '.gif', category: 'image' },
    'image/webp': { extension: '.webp', category: 'image' },
    'image/svg+xml': { extension: '.svg', category: 'image' },
    // Archives (stored in storage only)
    'application/zip': { extension: '.zip', category: 'archive' },
    'application/x-zip-compressed': { extension: '.zip', category: 'archive' },
    'application/x-rar-compressed': { extension: '.rar', category: 'archive' },
    'application/gzip': { extension: '.gz', category: 'archive' },
};
//# sourceMappingURL=index.js.map