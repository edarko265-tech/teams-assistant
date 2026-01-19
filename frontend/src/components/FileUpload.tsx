/**
 * FileUpload Component
 * Handles file upload and displays uploaded files for a channel
 * Only visible in channels, not in individual chats
 */

import React, { useState, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { UploadedFile } from '../types';
import UserAvatar from './UserAvatar';

interface FilePreviewModalProps {
  file: UploadedFile | null;
  onClose: () => void;
}

function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📄 {file.name}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <pre className="file-preview-content">{file.content}</pre>
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

    // Check file type
    const allowedExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.yaml', '.yml'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Read file content
    try {
      const content = await file.text();
      await uploadFile(file.name, content);
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
                accept=".txt,.md,.json,.csv,.xml,.yaml,.yml"
                onChange={handleFileSelect}
                className="files-upload-input"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="btn btn-primary files-upload-button">
                {isLoading ? 'Uploading...' : '📤 Upload File'}
              </label>
              <span className="files-upload-hint">
                Supported: .txt, .md, .json, .csv, .xml, .yaml
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
                  <div className="file-item-icon">📄</div>
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
