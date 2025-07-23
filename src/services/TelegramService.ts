import { supabase } from '@/integrations/supabase/client';

interface TelegramBotConfig {
  id: string;
  bot_token: string;
  bot_username?: string;
  use_personal_bot: boolean;
}

interface TelegramChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_type: string;
  is_default: boolean;
  bot_config_id: string;
}

export class TelegramService {
  private static instance: TelegramService;

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  /**
   * Get bot configuration for a user (personal or system default)
   */
  async getBotConfig(userId?: string): Promise<TelegramBotConfig | null> {
    try {
      let botConfig: TelegramBotConfig | null = null;

      // If user is logged in, try to get their personal bot config
      if (userId) {
        const { data: userConfig } = await supabase
          .from('user_bot_configs')
          .select('*')
          .eq('user_id', userId)
          .eq('use_personal_bot', true)
          .single();

        if (userConfig) {
          botConfig = userConfig;
        }
      }

      // If no personal config, get system default
      if (!botConfig) {
        const { data: systemConfig } = await supabase
          .from('user_bot_configs')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single();

        if (systemConfig) {
          botConfig = systemConfig;
        }
      }

      return botConfig;
    } catch (error) {
      console.error('Error getting bot config:', error);
      return null;
    }
  }

  /**
   * Get storage channel for user (personal or default)
   */
  async getStorageChannel(userId?: string): Promise<TelegramChannel | null> {
    try {
      let channel: TelegramChannel | null = null;

      // If user is logged in, try to get their personal channel
      if (userId) {
        const { data: userBotConfig } = await supabase
          .from('user_bot_configs')
          .select('id')
          .eq('user_id', userId)
          .eq('use_personal_bot', true)
          .single();

        if (userBotConfig) {
          const { data: userChannel } = await supabase
            .from('telegram_channels')
            .select('*')
            .eq('bot_config_id', userBotConfig.id)
            .single();

          if (userChannel) {
            channel = userChannel;
          }
        }
      }

      // If no personal channel, get system default
      if (!channel) {
        const { data: defaultChannel } = await supabase
          .from('telegram_channels')
          .select('*')
          .eq('is_default', true)
          .single();

        if (defaultChannel) {
          channel = defaultChannel;
        }
      }

      return channel;
    } catch (error) {
      console.error('Error getting storage channel:', error);
      return null;
    }
  }

  /**
   * Get default channel for file uploads (backward compatibility)
   */
  async getDefaultChannel(): Promise<TelegramChannel | null> {
    try {
      const { data } = await supabase
        .from('telegram_channels')
        .select('*')
        .eq('is_default', true)
        .single();

      return data;
    } catch (error) {
      console.error('Error getting default channel:', error);
      return null;
    }
  }

  /**
   * Upload file to Telegram
   */
  async uploadFile(
    file: File,
    metadata: {
      description?: string;
      school?: string;
      major?: string;
      tags?: string[];
    },
    userId?: string
  ): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      // Get bot configuration
      const botConfig = await this.getBotConfig(userId);
      if (!botConfig) {
        return { success: false, error: 'Không tìm thấy cấu hình bot' };
      }

      // Get storage channel (personal or default)
      const channel = await this.getStorageChannel(userId);
      if (!channel) {
        return { success: false, error: 'Không tìm thấy kênh lưu trữ' };
      }

      // Prepare form data for Telegram API
      const formData = new FormData();
      formData.append('chat_id', channel.channel_id);
      formData.append('document', file);
      
      // Create caption with metadata
      const caption = this.createFileCaption(file.name, metadata);
      formData.append('caption', caption);

      // Send to Telegram Bot API
      const response = await fetch(`https://api.telegram.org/bot${botConfig.bot_token}/sendDocument`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        // Save to database
        const document = result.result.document;
        const savedDoc = await this.saveDocumentToDatabase({
          file_id: document.file_id,
          file_unique_id: document.file_unique_id,
          file_name: document.file_name || file.name,
          file_size: document.file_size,
          mime_type: document.mime_type || file.type,
          description: metadata.description,
          school: metadata.school,
          major: metadata.major,
          tags: metadata.tags,
          uploaded_by: userId,
          telegram_user_id: result.result.from.id,
        });

        return { 
          success: true, 
          fileId: savedDoc?.id 
        };
      } else {
        return { 
          success: false, 
          error: result.description || 'Lỗi khi upload file lên Telegram' 
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return { 
        success: false, 
        error: 'Lỗi kết nối với Telegram API' 
      };
    }
  }

  /**
   * Download file from Telegram
   */
  async downloadFile(fileId: string, fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get document info from database
      const { data: document } = await supabase
        .from('documents')
        .select('*')
        .eq('file_id', fileId)
        .single();

      if (!document) {
        return { success: false, error: 'Không tìm thấy tài liệu' };
      }

      // Get bot config
      const botConfig = await this.getBotConfig(document.uploaded_by);
      if (!botConfig) {
        return { success: false, error: 'Không tìm thấy cấu hình bot' };
      }

      // Get file info from Telegram
      const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botConfig.bot_token}/getFile?file_id=${fileId}`);
      const fileInfo = await fileInfoResponse.json();

      if (fileInfo.ok) {
        const filePath = fileInfo.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${botConfig.bot_token}/${filePath}`;
        
        // Trigger download
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        return { success: true };
      } else {
        return { success: false, error: 'Không thể tải file từ Telegram' };
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      return { success: false, error: 'Lỗi khi tải file' };
    }
  }

  /**
   * Test bot connection
   */
  async testBotConnection(botToken: string): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const result = await response.json();

      if (result.ok) {
        return { success: true, botInfo: result.result };
      } else {
        return { success: false, error: result.description };
      }
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối với Telegram API' };
    }
  }

  /**
   * Create file caption with metadata
   */
  private createFileCaption(fileName: string, metadata: any): string {
    let caption = `📄 ${fileName}\n\n`;
    
    if (metadata.description) {
      caption += `📝 Mô tả: ${metadata.description}\n`;
    }
    
    if (metadata.school) {
      caption += `🏫 Trường: ${metadata.school}\n`;
    }
    
    if (metadata.major) {
      caption += `🎓 Ngành: ${metadata.major}\n`;
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      caption += `🏷️ Tags: ${metadata.tags.join(', ')}\n`;
    }
    
    caption += `\n📅 Upload: ${new Date().toLocaleString('vi-VN')}`;
    caption += `\n📱 Via: UniShare Bot`;

    return caption;
  }

  /**
   * Save document to database
   */
  private async saveDocumentToDatabase(documentData: any) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        console.error('Error saving document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving document to database:', error);
      return null;
    }
  }
}

export default TelegramService;
