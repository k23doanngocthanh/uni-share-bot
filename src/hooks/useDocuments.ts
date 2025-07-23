import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  file_id: string;
  description: string | null;
  school: string | null;
  major: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  availableSchools: string[];
  availableMajors: string[];
  availableTags: string[];
  searchDocuments: (query: string, school?: string, major?: string, tags?: string[]) => void;
  downloadDocument: (fileId: string, fileName: string) => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);
  const [availableMajors, setAvailableMajors] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchDocuments = async (query?: string, school?: string, major?: string, tags?: string[]) => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filters
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `file_name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (school && school.trim()) {
        queryBuilder = queryBuilder.eq('school', school);
      }

      if (major && major.trim()) {
        queryBuilder = queryBuilder.eq('major', major);
      }

      if (tags && tags.length > 0) {
        // Use overlaps operator for array matching
        queryBuilder = queryBuilder.overlaps('tags', tags);
      }

      const { data, error: fetchError } = await queryBuilder.limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách tài liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch unique schools
      const { data: schoolsData } = await supabase
        .from('documents')
        .select('school')
        .not('school', 'is', null)
        .not('school', 'eq', '');

      // Fetch unique majors
      const { data: majorsData } = await supabase
        .from('documents')
        .select('major')
        .not('major', 'is', null)
        .not('major', 'eq', '');

      // Fetch all tags
      const { data: tagsData } = await supabase
        .from('documents')
        .select('tags')
        .not('tags', 'is', null);

      // Process unique values
      const schools = [...new Set(schoolsData?.map(item => item.school).filter(Boolean) || [])];
      const majors = [...new Set(majorsData?.map(item => item.major).filter(Boolean) || [])];
      
      const allTags = tagsData?.flatMap(item => item.tags || []) || [];
      const uniqueTags = [...new Set(allTags)].filter(Boolean);

      setAvailableSchools(schools.sort());
      setAvailableMajors(majors.sort());
      setAvailableTags(uniqueTags.sort());
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const downloadDocument = async (fileId: string, fileName: string) => {
    try {
      // Call the bot API to get the file download URL
      const botToken = 'YOUR_BOT_TOKEN'; // This should be stored securely
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const data = await response.json();

      if (data.ok && data.result.file_path) {
        const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Đang tải xuống",
          description: `File "${fileName}" đang được tải xuống.`,
        });
      } else {
        throw new Error('File không tồn tại hoặc đã bị xóa');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      toast({
        title: "Lỗi tải file",
        description: "Không thể tải file. File có thể đã bị xóa hoặc không khả dụng.",
        variant: "destructive",
      });
    }
  };

  const searchDocuments = (query: string, school?: string, major?: string, tags?: string[]) => {
    fetchDocuments(query, school, major, tags);
  };

  useEffect(() => {
    fetchDocuments();
    fetchFilterOptions();
  }, []);

  return {
    documents,
    loading,
    error,
    availableSchools,
    availableMajors,
    availableTags,
    searchDocuments,
    downloadDocument,
  };
};