import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Download, 
  ExternalLink,
  FileText, 
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  File,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TelegramService from '@/services/TelegramService';

interface Document {
  id: string;
  file_name: string;
  original_file_name?: string; // Thêm để xử lý file hết hạn
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  school: string | null;
  major: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  file_id: string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload: (fileId: string, fileName: string, originalFileName?: string) => void;
}

const FilePreviewModal = ({ isOpen, onClose, document, onDownload }: FilePreviewModalProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    } else {
      // Clean up preview URL when modal closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setError(null);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, document]);

  const loadPreview = async () => {
    if (!document) return;

    setLoading(true);
    setError(null);

    try {
      const telegramService = TelegramService.getInstance();

      // Use new getFileBlob method for better error handling
      const result = await telegramService.getFileBlob(document.file_id);

      if (result.success && result.blob) {
        // For small files that can be previewed
        if (canPreview(document.mime_type) && document.file_size && document.file_size < 20 * 1024 * 1024) { // 20MB limit
          const url = URL.createObjectURL(result.blob);
          setPreviewUrl(url);
        } else {
          // For larger files, try to create direct URL if possible
          const botConfig = telegramService.getBotConfig();
          const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botConfig.bot_token}/getFile?file_id=${document.file_id}`);
          const fileInfo = await fileInfoResponse.json();
          
          if (fileInfo.ok) {
            const filePath = fileInfo.result.file_path;
            const downloadUrl = `https://api.telegram.org/file/bot${botConfig.bot_token}/${filePath}`;
            setPreviewUrl(downloadUrl);
          } else {
            setError('File không khả dụng');
          }
        }
      } else {
        setError(result.error || 'Không thể tải file để xem trước');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setError('Lỗi khi tải file preview');
    } finally {
      setLoading(false);
    }
  };

  const canPreview = (mimeType: string | null): boolean => {
    if (!mimeType) return false;
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('text/')
    );
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-8 w-8 text-gray-500" />;
    
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-pink-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-indigo-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return <Archive className="h-8 w-8 text-yellow-600" />;
    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('javascript')) return <Code className="h-8 w-8 text-gray-600" />;
    
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Đang tải preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!document || !previewUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            {getFileIcon(document?.mime_type || null)}
            <p className="text-gray-600 mt-4">Không thể xem trước file này</p>
            <p className="text-sm text-gray-500">Hãy tải về để xem</p>
          </div>
        </div>
      );
    }

    const mimeType = document.mime_type;

    // Image preview
    if (mimeType?.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center min-h-96 bg-gray-50 rounded-lg">
          <img 
            src={previewUrl} 
            alt={document.file_name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    }

    // PDF preview
    if (mimeType === 'application/pdf') {
      return (
        <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full rounded-lg border-0"
            title={document.file_name}
          />
        </div>
      );
    }

    // Video preview
    if (mimeType?.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg">
          <video 
            src={previewUrl} 
            controls 
            className="max-w-full max-h-96 rounded-lg shadow-lg"
          >
            Trình duyệt không hỗ trợ video preview
          </video>
        </div>
      );
    }

    // Audio preview
    if (mimeType?.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-indigo-500" />
            <audio src={previewUrl} controls className="mb-4">
              Trình duyệt không hỗ trợ audio preview
            </audio>
            <p className="text-gray-600">{document.file_name}</p>
          </div>
        </div>
      );
    }

    // Text preview
    if (mimeType?.startsWith('text/')) {
      return (
        <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title={document.file_name}
          />
        </div>
      );
    }

    // Default - no preview
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          {getFileIcon(mimeType)}
          <p className="text-gray-600 mt-4">Không thể xem trước file này</p>
          <p className="text-sm text-gray-500">{document.file_name}</p>
        </div>
      </div>
    );
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(document.mime_type)}
              <div>
                <CardTitle className="text-lg line-clamp-1">{document.file_name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span>Tải lên bởi {document.uploaded_by || 'Ẩn danh'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onDownload(document.file_id, document.file_name, document.original_file_name)}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-3">
            {document.school && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                🏫 {document.school}
              </Badge>
            )}
            {document.major && (
              <Badge variant="outline" className="border-purple-200 text-purple-700">
                🎓 {document.major}
              </Badge>
            )}
            {document.tags && document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                #{tag}
              </Badge>
            ))}
          </div>
          
          {document.description && (
            <p className="text-gray-600 text-sm mt-2">{document.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          {renderPreview()}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreviewModal;
