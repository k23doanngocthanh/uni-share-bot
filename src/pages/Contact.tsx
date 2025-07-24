import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Github,
  Facebook,
  Twitter
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const structuredData = (config: any) => ({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Liên hệ UniShare",
    "description": "Liên hệ với đội ngũ UniShare để được hỗ trợ và góp ý",
    "url": config.generateUrl('/contact'),
    "mainEntity": {
      "@type": "Organization",
      "name": config.siteName,
      "description": config.seo.defaultDescription,
      "url": config.baseUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "telephone": config.contact.phone,
        "email": config.contact.email,
        "availableLanguage": "Vietnamese",
        "areaServed": "VN"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "VN",
        "addressLocality": config.contact.address
      },
      "sameAs": [
        config.social.facebook,
        config.social.twitter,
        config.social.telegram
      ]
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Insert contact message
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null
        });

      if (insertError) throw insertError;

      // Success
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
      });

    } catch (error: any) {
      console.error('Error submitting contact:', error);
      setError(error.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cảm ơn bạn!
            </h2>
            <p className="text-gray-600 mb-6">
              Tin nhắn của bạn đã được gửi thành công. 
              Chúng tôi sẽ phản hồi trong vòng 24 giờ.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Gửi tin nhắn khác
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Liên hệ với UniShare - Hỗ trợ và góp ý"
        description="Liên hệ với đội ngũ UniShare để được hỗ trợ, góp ý hoặc báo cáo vấn đề. Chúng tôi luôn sẵn sàng lắng nghe và cải thiện dịch vụ."
        keywords="liên hệ unishare, hỗ trợ, góp ý, báo lỗi, contact, support"
        url="/contact"
      />
      
      <StructuredData data={structuredData} id="contact-structured-data" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📞 Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Có thắc mắc, góp ý hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe và giúp đỡ bạn.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">support@unishare.edu.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-sm text-gray-600">1900 1234 (8:00 - 22:00)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-sm text-gray-600">
                      Tầng 5, Tòa nhà ABC<br />
                      123 Đường XYZ, Quận 1<br />
                      TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theo dõi chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Github className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giờ hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Thứ 2 - Thứ 6</span>
                    <span className="font-medium">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thứ 7 - Chủ nhật</span>
                    <span className="font-medium">9:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hỗ trợ online</span>
                    <span className="font-medium text-green-600">24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Gửi tin nhắn cho chúng tôi</CardTitle>
                <CardDescription>
                  Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất có thể
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Chủ đề *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Vấn đề bạn muốn trao đổi"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tin nhắn *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Mô tả chi tiết vấn đề hoặc ý kiến của bạn..."
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Gửi tin nhắn
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Hỗ trợ kỹ thuật</h3>
              <p className="text-sm text-gray-600">
                Gặp vấn đề khi sử dụng? Chúng tôi sẽ hỗ trợ bạn ngay lập tức.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Góp ý cải thiện</h3>
              <p className="text-sm text-gray-600">
                Ý kiến của bạn giúp chúng tôi phát triển nền tảng tốt hơn.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Phone className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Hợp tác kinh doanh</h3>
              <p className="text-sm text-gray-600">
                Muốn hợp tác với UniShare? Liên hệ với đội ngũ kinh doanh.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
