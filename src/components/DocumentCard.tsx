import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Calendar, 
  User, 
  School, 
  GraduationCap,
  Image,
  Archive,
  Video,
  Music,
  Code,
  File,
  Eye,
  Share
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

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

interface DocumentCardProps {
  document: Document;
  onDownload: (fileId: string, fileName: string, originalFileName?: string) => void;
  onPreview: (document: Document) => void;
}

const FILE_TYPE_CONFIG = {
  // Documents
  'application/pdf': { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  'application/msword': { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'application/vnd.ms-excel': { icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'application/vnd.ms-powerpoint': { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  
  // Images
  'image/jpeg': { icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'image/jpg': { icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'image/png': { icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'image/gif': { icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'image/webp': { icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  
  // Archives
  'application/zip': { icon: Archive, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  'application/x-rar-compressed': { icon: Archive, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  'application/x-7z-compressed': { icon: Archive, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  
  // Videos
  'video/mp4': { icon: Video, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  'video/avi': { icon: Video, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  'video/mkv': { icon: Video, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  
  // Audio
  'audio/mp3': { icon: Music, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'audio/wav': { icon: Music, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'audio/flac': { icon: Music, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  
  // Code
  'text/plain': { icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  'application/json': { icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  'text/javascript': { icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  'text/html': { icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  'text/css': { icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
};

const DEFAULT_FILE_CONFIG = { 
  icon: File, 
  color: 'text-gray-500', 
  bgColor: 'bg-gray-50', 
  borderColor: 'border-gray-200' 
};

function DocumentCard({ document, onDownload, onPreview }: DocumentCardProps) {
  // Get file configuration based on mime type
  const fileConfig = document.mime_type ? 
    FILE_TYPE_CONFIG[document.mime_type as keyof typeof FILE_TYPE_CONFIG] || DEFAULT_FILE_CONFIG : 
    DEFAULT_FILE_CONFIG;
  
  const IconComponent = fileConfig.icon;

  // Helper functions
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (): string => {
    if (!document.file_name) return '';
    const extension = document.file_name.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${fileConfig.bgColor} ${fileConfig.borderColor} border flex items-center justify-center`}>
            <IconComponent className={`h-6 w-6 ${fileConfig.color}`} />
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
              {document.file_name}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${fileConfig.bgColor} ${fileConfig.color}`}>
                {getFileExtension()}
              </span>
              <span>{formatFileSize(document.file_size)}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(document.created_at), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onPreview(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDownload(document.file_id, document.file_name, document.original_file_name)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {document.description && (
          <CardDescription className="text-gray-600 line-clamp-2 mt-2">
            {document.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* School and Major */}
        <div className="flex flex-wrap gap-2">
          {document.school && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700">
              <School className="h-3 w-3" />
              {document.school}
            </Badge>
          )}
          {document.major && (
            <Badge variant="outline" className="flex items-center gap-1 border-purple-200 text-purple-700">
              <GraduationCap className="h-3 w-3" />
              {document.major}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Uploader info */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {document.uploaded_by || "Ẩn danh"}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-600"
            onClick={() => {
              // Copy direct share link to this specific document
              const shareUrl = `${window.location.origin}/?doc=${document.id}`;
              navigator.clipboard.writeText(shareUrl).then(() => {
                // Use toast instead of alert
                const toast = window.document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
                toast.textContent = 'Link tài liệu đã được sao chép!';
                window.document.body.appendChild(toast);
                setTimeout(() => {
                  toast.style.opacity = '0';
                  setTimeout(() => window.document.body.removeChild(toast), 300);
                }, 2000);
              }).catch(() => {
                const toast = window.document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                toast.textContent = 'Không thể sao chép link!';
                window.document.body.appendChild(toast);
                setTimeout(() => {
                  toast.style.opacity = '0';
                  setTimeout(() => window.document.body.removeChild(toast), 300);
                }, 2000);
              });
            }}
          >
            <Share className="h-3 w-3 mr-1" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentCard;