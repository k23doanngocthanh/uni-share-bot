import React from 'react';
import DocumentCard from '@/components/DocumentCard';
import { usePagination } from '@/hooks/usePagination';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Clock } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  original_file_name?: string;
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

interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  onDownload: (fileId: string, fileName: string, originalFileName?: string) => void;
  onPreview: (document: Document) => void;
  onClearFilters: () => void;
  itemsPerPage?: number;
}

const DocumentGrid = ({ 
  documents, 
  loading, 
  error, 
  onDownload, 
  onPreview, 
  onClearFilters,
  itemsPerPage = 12 
}: DocumentGridProps) => {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
    hasNextPage,
    hasPreviousPage,
  } = usePagination({
    totalItems: documents.length,
    itemsPerPage,
  });

  const currentDocuments = documents.slice(
    paginatedData.startIndex,
    paginatedData.endIndex
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tài liệu mới nhất</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <Card key={i} className="p-6 border-0 bg-white/80">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Tài liệu mới nhất</h2>
        </div>
        
        <Card className="p-12 text-center border-0 bg-red-50">
          <div className="text-red-600">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2 font-semibold">Có lỗi xảy ra</p>
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Tài liệu mới nhất</h2>
        </div>
        
        <Card className="p-12 text-center border-0 bg-gray-50">
          <div className="text-gray-500">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2 font-semibold">Không tìm thấy tài liệu</p>
            <p className="text-sm mb-6">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            <Button variant="outline" onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tài liệu mới nhất</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4" />
            <span>
              Hiển thị {paginatedData.startIndex + 1}-{Math.min(paginatedData.endIndex, documents.length)} 
              trong tổng số {documents.length} tài liệu
            </span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={goToPreviousPage}
                  className={!hasPreviousPage ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => goToPage(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={goToNextPage}
                  className={!hasNextPage ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DocumentGrid;