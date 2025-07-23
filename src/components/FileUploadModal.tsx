import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TelegramService from '@/services/TelegramService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  X, 
  Plus, 
  FileText, 
  Image, 
  Archive, 
  Video,
  Music,
  Code,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

const SUPPORTED_FILE_TYPES = {
  // Documents
  'application/pdf': { icon: FileText, color: 'text-red-500', category: 'document' },
  'application/msword': { icon: FileText, color: 'text-blue-500', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500', category: 'document' },
  'application/vnd.ms-excel': { icon: FileText, color: 'text-green-500', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, color: 'text-green-500', category: 'document' },
  'application/vnd.ms-powerpoint': { icon: FileText, color: 'text-orange-500', category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, color: 'text-orange-500', category: 'document' },
  'text/plain': { icon: FileText, color: 'text-gray-500', category: 'document' },
  
  // Images
  'image/jpeg': { icon: Image, color: 'text-purple-500', category: 'image' },
  'image/jpg': { icon: Image, color: 'text-purple-500', category: 'image' },
  'image/png': { icon: Image, color: 'text-purple-500', category: 'image' },
  'image/gif': { icon: Image, color: 'text-purple-500', category: 'image' },
  'image/webp': { icon: Image, color: 'text-purple-500', category: 'image' },
  
  // Archives
  'application/zip': { icon: Archive, color: 'text-yellow-500', category: 'archive' },
  'application/x-rar-compressed': { icon: Archive, color: 'text-yellow-500', category: 'archive' },
  'application/x-7z-compressed': { icon: Archive, color: 'text-yellow-500', category: 'archive' },
  
  // Videos
  'video/mp4': { icon: Video, color: 'text-pink-500', category: 'video' },
  'video/avi': { icon: Video, color: 'text-pink-500', category: 'video' },
  'video/mov': { icon: Video, color: 'text-pink-500', category: 'video' },
  
  // Audio
  'audio/mpeg': { icon: Music, color: 'text-indigo-500', category: 'audio' },
  'audio/wav': { icon: Music, color: 'text-indigo-500', category: 'audio' },
  'audio/mp3': { icon: Music, color: 'text-indigo-500', category: 'audio' },
  
  // Code
  'text/javascript': { icon: Code, color: 'text-yellow-600', category: 'code' },
  'text/html': { icon: Code, color: 'text-orange-600', category: 'code' },
  'text/css': { icon: Code, color: 'text-blue-600', category: 'code' },
  'application/json': { icon: Code, color: 'text-gray-600', category: 'code' },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

const FileUploadModal = ({ isOpen, onClose, onSuccess, user }: FileUploadModalProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (mimeType: string) => {
    const fileInfo = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES];
    if (fileInfo) {
      const IconComponent = fileInfo.icon;
      return <IconComponent className={`h-8 w-8 ${fileInfo.color}`} />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({
        title: "Quá nhiều file",
        description: `Chỉ có thể upload tối đa ${MAX_FILES} file cùng lúc.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: UploadedFile[] = [];
    
    selectedFiles.forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File quá lớn",
          description: `File "${file.name}" vượt quá giới hạn ${formatFileSize(MAX_FILE_SIZE)}.`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
        toast({
          title: "Loại file không hỗ trợ",
          description: `File "${file.name}" có định dạng không được hỗ trợ.`,
          variant: "destructive",
        });
        return;
      }

      const uploadFile: UploadedFile = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        progress: 0
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadFile.preview = e.target?.result as string;
          setFiles(prev => prev.map(f => f.id === uploadFile.id ? uploadFile : f));
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(uploadFile);
    });

    setFiles(prev => [...prev, ...validFiles]);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const uploadToTelegram = async (file: File): Promise<string> => {
    const telegramService = TelegramService.getInstance();
    
    const userName = user?.user_metadata?.full_name || user?.email || 'Ẩn danh';
    
    const result = await telegramService.uploadFile(file, {
      description,
      school,
      major,
      tags: tags.length > 0 ? tags : undefined
    }, user?.id, userName);

    if (result.success && result.fileId) {
      return result.fileId;
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "Chưa chọn file",
        description: "Vui lòng chọn ít nhất một file để upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const uploadFile of files) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            ));
          }, 200);

          // Upload to Telegram (TelegramService đã tự động save vào database)
          const fileId = await uploadToTelegram(uploadFile.file);
          
          clearInterval(progressInterval);

          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          ));

        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          ));
        }
      }

      const successCount = files.filter(f => f.status === 'success').length;
      const errorCount = files.filter(f => f.status === 'error').length;

      if (successCount > 0) {
        toast({
          title: "Upload thành công",
          description: `${successCount} file đã được upload thành công.`,
        });
        onSuccess();
      }

      if (errorCount > 0) {
        toast({
          title: "Có lỗi xảy ra",
          description: `${errorCount} file upload thất bại.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Lỗi upload",
        description: "Có lỗi xảy ra trong quá trình upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDescription('');
    setSchool('');
    setMajor('');
    setTags([]);
    setNewTag('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Tài Liệu
          </CardTitle>
          <CardDescription>
            Upload tài liệu học tập để chia sẻ với cộng đồng sinh viên
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Chọn file</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Kéo thả file hoặc click để chọn
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Hỗ trợ PDF, Word, Excel, PowerPoint, hình ảnh và nhiều định dạng khác
              </p>
              <p className="text-xs text-muted-foreground">
                Tối đa {MAX_FILES} file, mỗi file không quá {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z,.mp4,.avi,.mov,.mp3,.wav,.js,.html,.css,.json"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label>File đã chọn ({files.length})</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {uploadFile.preview ? (
                        <img 
                          src={uploadFile.preview} 
                          alt={uploadFile.file.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(uploadFile.file.type)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={uploadFile.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Đang upload... {uploadFile.progress}%
                          </p>
                        </div>
                      )}
                      
                      {uploadFile.status === 'success' && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Upload thành công</span>
                        </div>
                      )}
                      
                      {uploadFile.status === 'error' && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">
                            {uploadFile.error || 'Upload thất bại'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {uploadFile.status !== 'uploading' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">Trường đại học</Label>
              <Input
                id="school"
                placeholder="VD: Đại học Bách Khoa"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Ngành học</Label>
              <Input
                id="major"
                placeholder="VD: Công nghệ thông tin"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả nội dung tài liệu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Thêm tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isUploading}>
              Reset
            </Button>
            <Button onClick={uploadFiles} disabled={isUploading || files.length === 0}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload {files.length > 0 && `(${files.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadModal;
