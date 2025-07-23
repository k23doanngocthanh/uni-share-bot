import { useState, useCallback, useEffect } from 'react';
import DocumentCard from '@/components/DocumentCard';
import { SearchFilters } from '@/components/SearchFilters';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import UserMenu from '@/components/UserMenu';
import FileUploadModal from '@/components/FileUploadModal';
import FilePreviewModal from '@/components/FilePreviewModal';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Upload, 
  Search, 
  TrendingUp, 
  Users, 
  FileText, 
  Bot,
  ArrowRight,
  Download,
  Star,
  Clock
} from 'lucide-react';

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

  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Check user authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const actualSchool = school === "all" ? "" : school;
    setSelectedSchool(actualSchool);
    searchDocuments(searchQuery, actualSchool, selectedMajor, selectedTags);
  };

  const handleMajorChange = (major: string) => {
    const actualMajor = major === "all" ? "" : major;
    setSelectedMajor(actualMajor);
    searchDocuments(searchQuery, selectedSchool, actualMajor, selectedTags);
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

  const handlePreview = (document: any) => {
    setSelectedDocument(document);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header 
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onUploadClick={() => setIsUploadModalOpen(true)}
        UserMenuComponent={UserMenu}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <BookOpen className="h-16 w-16" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              UniShare
              <span className="block text-2xl font-light text-blue-100 mt-3">
                Nền tảng chia sẻ tài liệu học tập thông minh
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Kết nối sinh viên các trường đại học, chia sẻ tài liệu học tập một cách dễ dàng 
              thông qua Telegram Bot và tìm kiếm thông minh.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
                onClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)}
              >
                <Upload className="mr-2 h-6 w-6" />
                Tải lên tài liệu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-semibold px-8 py-4 text-lg">
                <Bot className="mr-2 h-6 w-6" />
                Sử dụng Bot Telegram
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              >
                <Search className="mr-2 h-6 w-6" />
                Khám phá tài liệu
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <FileText className="h-10 w-10 mb-3 mx-auto text-blue-200" />
                <div className="text-3xl font-bold mb-1">{documents.length}+</div>
                <div className="text-blue-200">Tài liệu</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Users className="h-10 w-10 mb-3 mx-auto text-blue-200" />
                <div className="text-3xl font-bold mb-1">{availableSchools.length}+</div>
                <div className="text-blue-200">Trường ĐH</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <TrendingUp className="h-10 w-10 mb-3 mx-auto text-blue-200" />
                <div className="text-3xl font-bold mb-1">{availableMajors.length}+</div>
                <div className="text-blue-200">Ngành học</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tại sao chọn UniShare?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nền tảng được thiết kế dành riêng cho sinh viên với các tính năng thông minh và dễ sử dụng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Upload qua Telegram</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload tài liệu trực tiếp qua Telegram Bot, không cần đăng nhập website phức tạp
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Tìm kiếm thông minh</h3>
              <p className="text-gray-600 leading-relaxed">
                Tìm kiếm theo trường, ngành, môn học và từ khóa với thuật toán tìm kiếm thông minh
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Cộng đồng sinh viên</h3>
              <p className="text-gray-600 leading-relaxed">
                Kết nối với sinh viên cùng trường, cùng ngành để chia sẻ và trao đổi kiến thức
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Tìm kiếm tài liệu</h3>
              <p className="text-gray-600">Sử dụng bộ lọc để tìm tài liệu phù hợp với nhu cầu học tập</p>
            </div>
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
        <div id="documents" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Tài liệu mới nhất
              </h2>
              {documents.length > 0 && (
                <p className="text-gray-600 mt-1">
                  Hiển thị {documents.length} tài liệu
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Cập nhật liên tục
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 border-0 bg-white/80">
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
            <Card className="p-12 text-center border-0 bg-red-50">
              <div className="text-red-600">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2 font-semibold">Có lỗi xảy ra</p>
                <p className="text-sm">{error}</p>
              </div>
            </Card>
          ) : documents.length === 0 ? (
            <Card className="p-12 text-center border-0 bg-gray-50">
              <div className="text-gray-500">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2 font-semibold">Không tìm thấy tài liệu</p>
                <p className="text-sm mb-6">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDownload={downloadDocument}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
      
      {user && (
        <>
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
          />
          
          <FileUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => {
              setIsUploadModalOpen(false);
              // Refresh documents after upload
              searchDocuments(searchQuery, selectedSchool, selectedMajor, selectedTags);
            }}
            user={user}
          />

          <FilePreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onDownload={downloadDocument}
          />
        </>
      )}
    </div>
  );
};

export default Index;
