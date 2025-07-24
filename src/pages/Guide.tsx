import React from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Download, 
  Eye, 
  User, 
  Settings,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  BookOpen,
  MessageCircle,
  Shield,
  Clock
} from "lucide-react";

const GuideStep = ({ icon: Icon, title, description, badge }: {
  icon: any;
  title: string;
  description: string;
  badge?: string;
}) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && <Badge variant="secondary" className="mt-1">{badge}</Badge>}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm leading-relaxed">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

const Guide = () => {
  const structuredData = (config: any) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hướng dẫn sử dụng UniShare",
    "description": "Hướng dẫn chi tiết cách sử dụng UniShare để tải lên, tìm kiếm và chia sẻ tài liệu học tập",
    "url": config.generateUrl('/guide'),
    "publisher": {
      "@type": "Organization",
      "name": config.companyName,
      "url": config.baseUrl
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Đăng ký tài khoản",
        "text": "Tạo tài khoản UniShare để bắt đầu chia sẻ tài liệu"
      },
      {
        "@type": "HowToStep", 
        "name": "Tải lên tài liệu",
        "text": "Upload tài liệu học tập của bạn để chia sẻ với cộng đồng"
      },
      {
        "@type": "HowToStep",
        "name": "Tìm kiếm tài liệu",
        "text": "Sử dụng bộ lọc để tìm kiếm tài liệu phù hợp"
      }
    ],
    "totalTime": "PT10M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "VND",
      "value": "0"
    }
  });

  return (
    <Layout>
      <SEO 
        title="Hướng dẫn sử dụng UniShare - Chia sẻ tài liệu học tập miễn phí"
        description="Hướng dẫn chi tiết cách sử dụng UniShare để tải lên, tìm kiếm và chia sẻ tài liệu học tập. Tìm hiểu về Telegram Bot và các tính năng nâng cao."
        keywords="hướng dẫn unishare, cách sử dụng, tải tài liệu, telegram bot, chia sẻ file, hệ thống học tập"
        url="/guide"
      />
      
      <StructuredData data={structuredData} id="guide-structured-data" />
      
      <div className="container mx-auto px-4 py-8">{/* Gộp className vào một div */}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Hướng dẫn sử dụng UniShare
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống chia sẻ tài liệu học tập miễn phí cho sinh viên. 
            Tìm hiểu cách sử dụng tất cả tính năng của nền tảng.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Bắt đầu nhanh
            </CardTitle>
            <CardDescription>
              Những bước cơ bản để sử dụng UniShare hiệu quả
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GuideStep
                icon={User}
                title="1. Đăng ký tài khoản"
                description="Tạo tài khoản miễn phí để upload và quản lý tài liệu của bạn. Không bắt buộc đăng ký để tìm kiếm và tải về."
                badge="Tùy chọn"
              />
              <GuideStep
                icon={Upload}
                title="2. Upload tài liệu"
                description="Tải lên các file PDF, Word, Excel, hình ảnh và video. Hệ thống hỗ trợ nhiều định dạng file khác nhau."
              />
              <GuideStep
                icon={Search}
                title="3. Tìm kiếm"
                description="Sử dụng bộ lọc theo trường, ngành học, loại file để tìm tài liệu phù hợp với nhu cầu học tập."
              />
              <GuideStep
                icon={Download}
                title="4. Tải về & Xem"
                description="Preview trực tiếp hoặc tải về tài liệu. Tất cả đều miễn phí và không giới hạn số lần tải."
                badge="Miễn phí"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Guide */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Hướng dẫn Upload tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Các loại file được hỗ trợ:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span><strong>Tài liệu:</strong> PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-green-500" />
                    <span><strong>Hình ảnh:</strong> JPG, PNG, GIF, WebP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" />
                    <span><strong>Video:</strong> MP4, AVI, MOV, MKV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    <span><strong>Âm thanh:</strong> MP3, WAV, AAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-orange-500" />
                    <span><strong>Nén:</strong> ZIP, RAR, 7Z</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Quy trình upload:</h3>
                <ol className="space-y-2 text-sm">
                  <li>1. Nhấn nút "Upload tài liệu" trên trang chủ</li>
                  <li>2. Chọn file từ máy tính (kéo thả hoặc nhấn chọn)</li>
                  <li>3. Điền thông tin: tên file, mô tả, trường học, ngành học</li>
                  <li>4. Thêm tags để dễ tìm kiếm</li>
                  <li>5. Nhấn "Upload" và chờ hệ thống xử lý</li>
                  <li>6. File sẽ được lưu trữ và chia sẻ tự động</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Guide */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6" />
              Hướng dẫn Tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Tìm kiếm cơ bản</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Nhập từ khóa vào ô tìm kiếm</li>
                  <li>• Tìm theo tên file, mô tả, tags</li>
                  <li>• Kết quả hiển thị ngay lập tức</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Bộ lọc nâng cao</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Trường học:</strong> Lọc theo trường đại học</li>
                  <li>• <strong>Ngành học:</strong> Lọc theo chuyên ngành</li>
                  <li>• <strong>Loại file:</strong> PDF, Word, Excel, v.v.</li>
                  <li>• <strong>Thời gian:</strong> Mới nhất, cũ nhất</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Mẹo tìm kiếm</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Sử dụng từ khóa cụ thể</li>
                  <li>• Kết hợp nhiều bộ lọc</li>
                  <li>• Lưu kết quả tìm kiếm quan tâm</li>
                  <li>• Theo dõi tài liệu mới</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Tính năng chính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GuideStep
                icon={Eye}
                title="Preview trực tiếp"
                description="Xem trước nội dung file PDF, hình ảnh, video ngay trên trình duyệt mà không cần tải về."
              />
              <GuideStep
                icon={Download}
                title="Tải về không giới hạn"
                description="Tải về bất kỳ tài liệu nào miễn phí, không giới hạn số lần và dung lượng."
              />
              <GuideStep
                icon={Shield}
                title="An toàn & bảo mật"
                description="Tất cả file được quét virus tự động. Thông tin cá nhân được bảo vệ tuyệt đối."
              />
              <GuideStep
                icon={Clock}
                title="Cập nhật liên tục"
                description="Hệ thống được cập nhật thường xuyên với tài liệu mới từ cộng đồng sinh viên."
              />
              <GuideStep
                icon={User}
                title="Quản lý tài khoản"
                description="Theo dõi lịch sử upload, tài liệu đã tải, và quản lý thông tin cá nhân."
              />
              <GuideStep
                icon={MessageCircle}
                title="Hỗ trợ 24/7"
                description="Đội ngũ hỗ trợ sẵn sàng giải đáp mọi thắc mắc và xử lý các vấn đề kỹ thuật."
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">❓ Câu hỏi thường gặp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">UniShare có miễn phí không?</h3>
                <p className="text-gray-600">Có, hoàn toàn miễn phí. Bạn có thể tải lên, tìm kiếm và tải về tài liệu mà không mất phí.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Có giới hạn dung lượng file không?</h3>
                <p className="text-gray-600">Mỗi file tối đa 100MB. Hỗ trợ hầu hết các định dạng file phổ biến.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Làm sao để file của tôi được nhiều người tìm thấy?</h3>
                <p className="text-gray-600">Điền đầy đủ thông tin mô tả, chọn đúng trường/ngành học, và thêm tags phù hợp.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Tôi có thể xóa file đã upload không?</h3>
                <p className="text-gray-600">Hiện tại chưa hỗ trợ tính năng này. Vui lòng liên hệ admin để được hỗ trợ.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">File có bị mất sau một thời gian không?</h3>
                <p className="text-gray-600">File Telegram có thể hết hạn sau 12 giờ. Chúng tôi đang phát triển hệ thống lưu trữ riêng để khắc phục vấn đề này.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Guide;
