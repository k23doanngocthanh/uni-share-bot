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
  
  // Bot mặc định của hệ thống - cố định
  private static readonly DEFAULT_BOT_TOKEN = '7208604161:AAExB0QL6eg1Hkaw3-iMxfEMnvEtVO6N3sI';
  private static readonly DEFAULT_BOT_USERNAME = 'consenluutru_bot';
  private static readonly DEFAULT_CHAT_ID = '5717458324'; // User ID người nhận mặc định

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  /**
   * Get bot configuration - always use system default (hardcoded)
   */
  getBotConfig(): TelegramBotConfig {
    return {
      id: 'system-default',
      bot_token: TelegramService.DEFAULT_BOT_TOKEN,
      bot_username: TelegramService.DEFAULT_BOT_USERNAME,
      use_personal_bot: false
    };
  }

  /**
   * Get default chat ID - always use system default (hardcoded)
   */
  getDefaultChatId(): string {
    return TelegramService.DEFAULT_CHAT_ID;
  }

  /**
   * Upload file to Telegram - luôn dùng bot và chat mặc định
   */
  async uploadFile(
    file: File,
    metadata: {
      description?: string;
      school?: string;
      major?: string;
      tags?: string[];
    },
    userId?: string,
    userName?: string
  ): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      // Luôn sử dụng bot và chat mặc định
      const botConfig = this.getBotConfig();
      const chatId = this.getDefaultChatId();

      // Prepare form data for Telegram API
      const formData = new FormData();
      formData.append('chat_id', chatId);
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
      console.log('Telegram API response:', result);

      if (result.ok) {
        // Save to database
        const messageResult = result.result;
        
        // Telegram có thể trả về document, video, photo, audio, animation tùy theo loại file
        const fileInfo = messageResult.document || 
                        messageResult.video || 
                        messageResult.photo?.[messageResult.photo.length - 1] || // Lấy photo có resolution cao nhất
                        messageResult.audio ||
                        messageResult.animation ||
                        messageResult.voice ||
                        messageResult.video_note;
        
        if (!fileInfo) {
          console.error('No file info in result:', result);
          return { 
            success: false, 
            error: 'File uploaded but no file info returned' 
          };
        }

        const savedDoc = await this.saveDocumentToDatabase({
          file_id: fileInfo.file_id,
          file_unique_id: fileInfo.file_unique_id,
          file_name: fileInfo.file_name || file.name,
          original_file_name: file.name, // Lưu tên file gốc với extension
          file_size: fileInfo.file_size,
          mime_type: fileInfo.mime_type || file.type,
          description: metadata.description,
          school: metadata.school,
          major: metadata.major,
          tags: metadata.tags,
          uploaded_by: userName || 'Ẩn danh', // Tên người upload
          telegram_user_id: messageResult.from?.id || 0, // Bot ID (7208604161)
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
   * Download file from Telegram - luôn dùng bot mặc định
   * Xử lý file hết hạn bằng cách dùng original_file_name
   */
  async downloadFile(fileId: string, fileName: string, originalFileName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Luôn sử dụng bot mặc định
      const botConfig = this.getBotConfig();

      // Get file info from Telegram
      const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botConfig.bot_token}/getFile?file_id=${fileId}`);
      const fileInfo = await fileInfoResponse.json();

      if (fileInfo.ok) {
        const filePath = fileInfo.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${botConfig.bot_token}/${filePath}`;
        
        // Trigger download - ưu tiên dùng originalFileName nếu có
        const downloadName = originalFileName || fileName;
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        return { success: true };
      } else {
        // File có thể đã hết hạn
        const errorMsg = fileInfo.description?.includes('expired') || fileInfo.description?.includes('not found')
          ? 'File đã hết hạn (quá 12 giờ). Vui lòng liên hệ người upload để tải lại.'
          : 'Không thể tải file từ Telegram';
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      return { success: false, error: 'Lỗi khi tải file' };
    }
  }

  /**
   * Get file blob for preview - xử lý file hết hạn
   */
  async getFileBlob(fileId: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const botConfig = this.getBotConfig();

      // Get file info from Telegram
      const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botConfig.bot_token}/getFile?file_id=${fileId}`);
      const fileInfo = await fileInfoResponse.json();

      if (fileInfo.ok) {
        const filePath = fileInfo.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${botConfig.bot_token}/${filePath}`;
        
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const blob = await response.blob();
          return { success: true, blob };
        } else {
          return { success: false, error: 'Không thể tải file từ Telegram' };
        }
      } else {
        // File có thể đã hết hạn
        const errorMsg = fileInfo.description?.includes('expired') || fileInfo.description?.includes('not found')
          ? 'File đã hết hạn (quá 12 giờ). Telegram chỉ lưu file trong 12 giờ.'
          : 'Không thể tải file từ Telegram';
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error getting file blob:', error);
      return { success: false, error: 'Lỗi khi tải file' };
    }
  }
  async testBotConnection(botToken?: string): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    try {
      const token = botToken || TelegramService.DEFAULT_BOT_TOKEN;
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
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
