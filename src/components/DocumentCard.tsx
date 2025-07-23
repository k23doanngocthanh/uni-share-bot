import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, School, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Document {
  id: string;
  file_name: string;
  file_size: number | null;
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
  onDownload: (fileId: string, fileName: string) => void;
}

export const DocumentCard = ({ document, onDownload }: DocumentCardProps) => {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFileIcon = () => {
    return <FileText className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 border border-border/50 hover:border-primary/30 bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getFileIcon()}
            <CardTitle className="text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {document.file_name}
            </CardTitle>
          </div>
          <Button
            onClick={() => onDownload(document.file_id, document.file_name)}
            size="sm"
            className="shrink-0 ml-2 bg-primary hover:bg-primary-glow shadow-academic"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        {document.description && (
          <CardDescription className="text-muted-foreground line-clamp-2">
            {document.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* School and Major */}
        <div className="flex flex-wrap gap-2">
          {document.school && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <School className="h-3 w-3" />
              {document.school}
            </Badge>
          )}
          {document.major && (
            <Badge variant="outline" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {document.major}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* File info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {document.uploaded_by || "Ẩn danh"}
            </span>
            <span>{formatFileSize(document.file_size)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(document.created_at), { 
              addSuffix: true, 
              locale: vi 
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};