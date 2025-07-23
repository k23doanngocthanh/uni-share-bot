import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bot, 
  Save, 
  Copy, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const ProfileModal = ({ isOpen, onClose, user }: ProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');

  const systemBotInfo = {
    username: '@consenluutru_bot',
    description: 'Bot chính thức của hệ thống UniShare để upload và quản lý tài liệu'
  };

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      // Load additional profile data from database if needed
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Load user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (profile) {
        setFullName(profile.full_name || '');
        setSchool(profile.school || '');
        setMajor(profile.major || '');
        setBio(profile.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });

      if (authError) throw authError;

      // Save to user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          school: school,
          major: major,
          bio: bio,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được lưu.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được sao chép vào clipboard.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Hồ sơ cá nhân
          </CardTitle>
          <CardDescription>
            Quản lý thông tin cá nhân và xem thông tin bot hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="bot">Bot hệ thống</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email không thể thay đổi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ tên</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">Trường đại học</Label>
                    <Input
                      id="school"
                      type="text"
                      placeholder="VD: Đại học Bách Khoa"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Ngành học</Label>
                    <Input
                      id="major"
                      type="text"
                      placeholder="VD: Công nghệ thông tin"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea
                    id="bio"
                    placeholder="Chia sẻ một chút về bản thân..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bot" className="space-y-6">
              {/* System Bot Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Bot hệ thống</h3>
                  <Badge variant="default">Đang hoạt động</Badge>
                </div>
                
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Username:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-background px-2 py-1 rounded">
                            {systemBotInfo.username}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(systemBotInfo.username)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Mô tả:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {systemBotInfo.description}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Trạng thái:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Sẵn sàng phục vụ</span>
                        </div>
                      </div>
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Hệ thống sử dụng bot này để xử lý tất cả việc upload và download tài liệu. 
                          Dữ liệu được lưu trữ an toàn và bảo mật.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>ℹ️ <strong>Thông tin hệ thống:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Bot được quản lý tự động bởi hệ thống</li>
                    <li>Tất cả file upload sẽ được xử lý qua bot này</li>
                    <li>Không cần cấu hình, chỉ cần đăng nhập và sử dụng</li>
                    <li>Dữ liệu được mã hóa và bảo mật theo tiêu chuẩn cao</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Đóng
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileModal;
