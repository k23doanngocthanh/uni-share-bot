import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TelegramService from '@/services/TelegramService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Bot, 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle,
  AlertCircle,
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
  const [showBotToken, setShowBotToken] = useState(false);
  const { toast } = useToast();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');

  // Bot configuration state
  const [useBotPersonal, setUseBotPersonal] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [botDescription, setBotDescription] = useState('');
  
  // Channel configuration state
  const [storageChannelId, setStorageChannelId] = useState('');
  const [storageChannelName, setStorageChannelName] = useState('');
  const [storageChannelType, setStorageChannelType] = useState<'channel' | 'group'>('channel');

  const systemBotInfo = {
    username: '@unishare_documents_bot',
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

      // Load bot configuration
      const { data: botConfig, error: botError } = await supabase
        .from('user_bot_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (botError && botError.code !== 'PGRST116') {
        console.error('Error loading bot config:', botError);
        return;
      }

      if (botConfig) {
        setUseBotPersonal(botConfig.use_personal_bot);
        setBotToken(botConfig.bot_token || '');
        setBotUsername(botConfig.bot_username || '');
        setBotDescription(botConfig.bot_description || '');
        
        // Load associated channel configuration
        const { data: channels } = await supabase
          .from('telegram_channels')
          .select('*')
          .eq('bot_config_id', botConfig.id)
          .limit(1);
          
        if (channels && channels.length > 0) {
          const channel = channels[0];
          setStorageChannelId(channel.channel_id);
          setStorageChannelName(channel.channel_name);
          setStorageChannelType(channel.channel_type as 'channel' | 'group');
        }
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

  const testBotConnection = async () => {
    if (!botToken) {
      toast({
        title: "Thiếu token",
        description: "Vui lòng nhập Bot Token trước khi test.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const telegramService = TelegramService.getInstance();
      const result = await telegramService.testBotConnection(botToken);

      if (result.success && result.botInfo) {
        setBotUsername(result.botInfo.username || '');
        setBotDescription(result.botInfo.first_name || '');
        
        toast({
          title: "Kết nối thành công",
          description: `Bot "${result.botInfo.first_name}" (@${result.botInfo.username}) hoạt động bình thường.`,
        });
      } else {
        toast({
          title: "Kết nối thất bại",
          description: result.error || "Không thể kết nối với bot.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi test bot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testChannelAccess = async () => {
    if (!botToken || !storageChannelId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập Bot Token và Channel ID trước khi test.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test if bot can send message to channel
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: storageChannelId
        })
      });

      const result = await response.json();

      if (result.ok) {
        setStorageChannelName(result.result.title || result.result.first_name || 'Unknown');
        setStorageChannelType(result.result.type === 'channel' ? 'channel' : 'group');
        
        toast({
          title: "Kênh hợp lệ",
          description: `Bot có thể truy cập "${result.result.title || result.result.first_name}".`,
        });
      } else {
        toast({
          title: "Không thể truy cập kênh",
          description: result.description || "Bot không có quyền truy cập kênh này.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi test kênh.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBotConfig = async () => {
    setIsLoading(true);
    try {
      // Save bot configuration to database
      const { data: botConfigData, error: botError } = await supabase
        .from('user_bot_configs')
        .upsert({
          user_id: user.id,
          use_personal_bot: useBotPersonal,
          bot_token: useBotPersonal ? botToken : null,
          bot_username: useBotPersonal ? botUsername : null,
          bot_description: useBotPersonal ? botDescription : null,
          bot_status: useBotPersonal && botToken ? 'active' : 'inactive',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (botError) throw botError;

      // If using personal bot and has channel config, save channel
      if (useBotPersonal && storageChannelId && botConfigData) {
        const { error: channelError } = await supabase
          .from('telegram_channels')
          .upsert({
            channel_id: storageChannelId,
            channel_name: storageChannelName || 'My Storage Channel',
            channel_type: storageChannelType,
            bot_config_id: botConfigData.id,
            is_default: false,
            updated_at: new Date().toISOString()
          });

        if (channelError) throw channelError;
      }

      toast({
        title: "Cập nhật thành công",
        description: "Cấu hình bot đã được lưu.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật cấu hình bot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBotInfo = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin bot đã được sao chép vào clipboard.",
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
            Quản lý thông tin cá nhân và cấu hình bot Telegram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="bot">Cấu hình Bot</TabsTrigger>
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
              {/* System Bot Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Bot hệ thống</h3>
                  <Badge variant="default">Khuyến nghị</Badge>
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
                            onClick={() => copyBotInfo(systemBotInfo.username)}
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
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Sử dụng bot hệ thống để đảm bảo tích hợp tốt nhất và nhận được hỗ trợ đầy đủ.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Personal Bot Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Bot cá nhân</h3>
                  </div>
                  <Switch
                    checked={useBotPersonal}
                    onCheckedChange={setUseBotPersonal}
                  />
                </div>

                {useBotPersonal && (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Chức năng bot cá nhân đang trong giai đoạn phát triển. 
                        Vui lòng sử dụng bot hệ thống để có trải nghiệm tốt nhất.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="botToken">Bot Token</Label>
                      <div className="relative">
                        <Input
                          id="botToken"
                          type={showBotToken ? "text" : "password"}
                          placeholder="1234567890:AAE..."
                          value={botToken}
                          onChange={(e) => setBotToken(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowBotToken(!showBotToken)}
                        >
                          {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={testBotConnection}
                          disabled={isLoading || !botToken}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                          Test Connection
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lấy token từ @BotFather trên Telegram
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="botUsername">Bot Username</Label>
                      <Input
                        id="botUsername"
                        type="text"
                        placeholder="@your_bot"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="botDescription">Mô tả Bot</Label>
                      <Textarea
                        id="botDescription"
                        placeholder="Mô tả chức năng của bot cá nhân..."
                        value={botDescription}
                        onChange={(e) => setBotDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    {/* Channel Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <h4 className="font-medium">Cấu hình kênh lưu trữ</h4>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Bot cần được thêm vào channel/group với quyền gửi file để có thể lưu trữ tài liệu.
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-3 text-blue-900">🔧 Hướng dẫn setup kênh lưu trữ:</h5>
                          <ol className="space-y-2 text-sm text-blue-800">
                            <li>1. Tạo channel/group Telegram mới hoặc sử dụng có sẵn</li>
                            <li>2. Thêm bot của bạn vào channel/group</li>
                            <li>3. Cấp quyền <strong>Send Messages</strong> và <strong>Send Media</strong> cho bot</li>
                            <li>4. Lấy Channel ID bằng cách forward 1 tin nhắn từ channel đến @userinfobot</li>
                            <li>5. Copy ID (dạng -1001234567890) và paste vào ô bên dưới</li>
                          </ol>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <Label htmlFor="channelId">Channel/Group ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="channelId"
                            placeholder="-1001234567890 hoặc @channel_name"
                            value={storageChannelId}
                            onChange={(e) => setStorageChannelId(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={testChannelAccess}
                            disabled={isLoading || !botToken || !storageChannelId}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nhập ID channel/group (bắt đầu bằng -100) hoặc username (@channel_name)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="channelName">Tên kênh</Label>
                          <Input
                            id="channelName"
                            placeholder="My Storage Channel"
                            value={storageChannelName}
                            onChange={(e) => setStorageChannelName(e.target.value)}
                            disabled={!storageChannelId}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Loại kênh</Label>
                          <Select 
                            value={storageChannelType} 
                            onValueChange={(value: 'channel' | 'group') => setStorageChannelType(value)}
                            disabled={!storageChannelId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="channel">Channel</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Đóng
                  </Button>
                  <Button onClick={handleSaveBotConfig} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Lưu cấu hình
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
