import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TelegramService from '@/services/TelegramService';

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
      const telegramService = TelegramService.getInstance();
      const result = await telegramService.downloadFile(fileId, fileName);

      if (result.success) {
        toast({
          title: "Đang tải xuống",
          description: `File "${fileName}" đang được tải xuống.`,
        });
      } else {
        toast({
          title: "Lỗi tải xuống",
          description: result.error || "Không thể tải xuống file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải xuống file.",
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