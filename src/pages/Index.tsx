import { useState, useCallback } from 'react';
import { DocumentCard } from '@/components/DocumentCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Upload, Search, TrendingUp, Users, FileText } from 'lucide-react';

const Index = () => {
  const {
    documents,
    loading,
    error,
    availableSchools,
    availableMajors,
    availableTags,
    searchDocuments,
    downloadDocument,
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSearch = useCallback(() => {
    searchDocuments(searchQuery, selectedSchool, selectedMajor, selectedTags);
  }, [searchQuery, selectedSchool, selectedMajor, selectedTags, searchDocuments]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Auto-search after 500ms delay
    setTimeout(() => {
      searchDocuments(query, selectedSchool, selectedMajor, selectedTags);
    }, 500);
  };

  const handleSchoolChange = (school: string) => {
    setSelectedSchool(school);
    searchDocuments(searchQuery, school, selectedMajor, selectedTags);
  };

  const handleMajorChange = (major: string) => {
    setSelectedMajor(major);
    searchDocuments(searchQuery, selectedSchool, major, selectedTags);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    searchDocuments(searchQuery, selectedSchool, selectedMajor, newTags);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSchool('');
    setSelectedMajor('');
    setSelectedTags([]);
    searchDocuments('', '', '', []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <BookOpen className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              UniShare
              <span className="block text-3xl font-normal text-white/90 mt-2">
                Chia sẻ tài liệu học tập
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Nền tảng chia sẻ tài liệu học tập cho sinh viên các trường đại học.
              Upload qua Telegram Bot và tìm kiếm tài liệu một cách dễ dàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold">
                <Upload className="mr-2 h-5 w-5" />
                Hướng dẫn Upload
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Search className="mr-2 h-5 w-5" />
                Tìm tài liệu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{documents.length}</div>
              <div className="text-muted-foreground">Tài liệu</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{availableSchools.length}</div>
              <div className="text-muted-foreground">Trường đại học</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{availableMajors.length}</div>
              <div className="text-muted-foreground">Ngành học</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <SearchFilters
              searchQuery={searchQuery}
              selectedSchool={selectedSchool}
              selectedMajor={selectedMajor}
              selectedTags={selectedTags}
              availableSchools={availableSchools}
              availableMajors={availableMajors}
              availableTags={availableTags}
              onSearchChange={handleSearchChange}
              onSchoolChange={handleSchoolChange}
              onMajorChange={handleMajorChange}
              onTagToggle={handleTagToggle}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Tài liệu mới nhất
              {documents.length > 0 && (
                <span className="text-muted-foreground text-lg font-normal ml-2">
                  ({documents.length} tài liệu)
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Có lỗi xảy ra</p>
                <p className="text-sm">{error}</p>
              </div>
            </Card>
          ) : documents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Không tìm thấy tài liệu</p>
                <p className="text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDownload={downloadDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
