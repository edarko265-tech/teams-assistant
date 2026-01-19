/**
 * FileUpload Component
 * Handles file upload and displays uploaded files for a channel
 * Supports text files, PDFs, images, and archives
 * Only visible in channels, not in individual chats
 */

import React, { useState, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { UploadedFile, SUPPORTED_FILE_TYPES } from '../types';
import UserAvatar from './UserAvatar';

// Supported file extensions for upload
const SUPPORTED_EXTENSIONS = Object.keys(SUPPORTED_FILE_TYPES);
const ACCEPT_STRING = SUPPORTED_EXTENSIONS.join(',');

/**
 * Get icon for file based on extension or MIME type
 */
function getFileIcon(fileName: string, mimeType?: string): string {
  const ext = ('.' + fileName.split('.').pop()?.toLowerCase()) as keyof typeof SUPPORTED_FILE_TYPES;
  if (SUPPORTED_FILE_TYPES[ext]) {
    return SUPPORTED_FILE_TYPES[ext].icon;
  }
  // Fallback based on mime type
  if (mimeType?.startsWith('image/')) return '🖼️';
  if (mimeType?.includes('pdf')) return '📕';
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return '📦';
  return '📄';
}

/**
 * Check if file can be previewed (text-based files)
 */
function canPreviewFile(fileName: string, mimeType?: string): boolean {
  const ext = ('.' + fileName.split('.').pop()?.toLowerCase()) as keyof typeof SUPPORTED_FILE_TYPES;
  if (SUPPORTED_FILE_TYPES[ext]) {
    return SUPPORTED_FILE_TYPES[ext].category === 'text';
  }
  return mimeType?.startsWith('text/') || false;
}

interface FilePreviewModalProps {
  file: UploadedFile | null;
  onClose: () => void;
}

function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  const icon = getFileIcon(file.name, file.mimeType);
  const previewable = canPreviewFile(file.name, file.mimeType);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{icon} {file.name}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {previewable && file.content ? (
            <pre className="file-preview-content">{file.content}</pre>
          ) : (
            <div className="file-no-preview">
              <span className="file-no-preview-icon">{icon}</span>
              <p>Preview not available for this file type</p>
              <p className="file-no-preview-type">{file.mimeType || 'Unknown type'}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function FilesModal({ isOpen, onClose }: FilesModalProps) {
  const { files, uploadFile, canUploadFiles, formatTimestamp, formatFileSize, isLoading } =
    useChat();
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileExtension = ('.' + file.name.split('.').pop()?.toLowerCase()) as keyof typeof SUPPORTED_FILE_TYPES;
    if (!SUPPORTED_FILE_TYPES[fileExtension]) {
      setUploadError(`Invalid file type. Allowed types: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    try {
      await uploadFile(file);
      setUploadError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUploadError('Failed to upload file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal files-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📁 Channel Files</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* Upload section */}
          {canUploadFiles && (
            <div className="files-upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_STRING}
                onChange={handleFileSelect}
                className="files-upload-input"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="btn btn-primary files-upload-button">
                {isLoading ? 'Uploading...' : '📤 Upload File'}
              </label>
              <span className="files-upload-hint">
                Supported: Text, PDF, Images, ZIP (max 10MB)
              </span>
              {uploadError && <div className="files-upload-error">{uploadError}</div>}
            </div>
          )}

          {/* Files list */}
          <div className="files-list">
            {files.length === 0 ? (
              <div className="files-list-empty">
                <span>📂</span>
                <p>No files uploaded yet</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="file-item"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="file-item-icon">{getFileIcon(file.name, file.mimeType)}</div>
                  <div className="file-item-info">
                    <span className="file-item-name">{file.name}</span>
                    <span className="file-item-meta">
                      {formatFileSize(file.size)} • Uploaded by{' '}
                      {file.uploadedBy.name} • {formatTimestamp(file.uploadedAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
    </div>
  );
}

export function FileUpload() {
  const { canUploadFiles, files } = useChat();
  const [showModal, setShowModal] = useState(false);

  // Don't render if not in a channel
  if (!canUploadFiles) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-icon"
        onClick={() => setShowModal(true)}
        title="View/Upload Files"
      >
        📁 <span className="file-count">{files.length}</span>
      </button>

      <FilesModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default FileUpload;
