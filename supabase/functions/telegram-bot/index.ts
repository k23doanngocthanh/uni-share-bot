import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Initialize Telegram bot
const bot = new Bot(Deno.env.get("BOT_TOKEN")!);

// Start command
bot.command("start", (ctx) => {
  ctx.reply(
    "🎓 Chào mừng đến với UniShare Bot!\n\n" +
    "📚 Gửi tài liệu (PDF, DOCX, PPT, v.v.) để chia sẻ với sinh viên khác\n" +
    "🏫 Sử dụng caption để ghi chú: trường, ngành, mô tả\n\n" +
    "Ví dụ caption: 'HCMUS - CNTT - Bài giảng Thuật toán'\n\n" +
    "Lệnh:\n" +
    "/get <file_id> - Tải file\n" +
    "/myfiles - Xem file của bạn\n" +
    "/delete <doc_id> - Xóa tài liệu"
  );
});

// Handle document uploads
bot.on(":document", async (ctx) => {
  try {
    const doc = ctx.message.document;
    const from = ctx.from!;
    const caption = ctx.message.caption || "";

    // Parse caption for metadata
    const parts = caption.split(" - ");
    const school = parts[0] || "";
    const major = parts[1] || "";
    const description = parts.slice(2).join(" - ") || doc.file_name;

    // Parse tags from description
    const tags: string[] = [];
    if (school) tags.push(school.toLowerCase());
    if (major) tags.push(major.toLowerCase());

    // Insert document metadata into Supabase
    const { data, error } = await supabase
      .from("documents")
      .insert({
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type || "application/octet-stream",
        file_id: doc.file_id,
        file_unique_id: doc.file_unique_id,
        description: description,
        school: school,
        major: major,
        tags: tags,
        uploaded_by: from.username || from.first_name,
        telegram_user_id: from.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return ctx.reply("❌ Lỗi lưu tài liệu vào database!");
    }

    ctx.reply(
      `✅ Tài liệu đã được lưu thành công!\n\n` +
      `📁 File: ${doc.file_name}\n` +
      `📊 Kích thước: ${(doc.file_size / 1024 / 1024).toFixed(2)} MB\n` +
      `🏫 Trường: ${school || "Chưa xác định"}\n` +
      `🎓 Ngành: ${major || "Chưa xác định"}\n` +
      `🆔 ID: ${data.id}\n\n` +
      `💡 Truy cập website để tìm kiếm và tải tài liệu!`
    );
  } catch (error) {
    console.error("Error processing document:", error);
    ctx.reply("❌ Có lỗi xảy ra khi xử lý tài liệu!");
  }
});

// Get file command
bot.command("get", async (ctx) => {
  const fileId = ctx.match;
  if (!fileId) {
    return ctx.reply("❌ Sử dụng: /get <file_id>");
  }

  try {
    const file = await ctx.api.getFile(fileId);
    const downloadUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    ctx.reply(`📥 Download link: ${downloadUrl}`);
  } catch (error) {
    console.error("Error getting file:", error);
    ctx.reply("❌ File không tồn tại hoặc đã bị xóa.");
  }
});

// List user's files
bot.command("myfiles", async (ctx) => {
  try {
    const from = ctx.from!;
    const { data, error } = await supabase
      .from("documents")
      .select("id, file_name, school, major, created_at")
      .eq("telegram_user_id", from.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Database error:", error);
      return ctx.reply("❌ Lỗi truy vấn database!");
    }

    if (!data || data.length === 0) {
      return ctx.reply("📂 Bạn chưa upload tài liệu nào.");
    }

    let message = "📚 Tài liệu của bạn:\n\n";
    data.forEach((doc, index) => {
      const date = new Date(doc.created_at).toLocaleDateString("vi-VN");
      message += `${index + 1}. ${doc.file_name}\n`;
      message += `   🏫 ${doc.school || "N/A"} - 🎓 ${doc.major || "N/A"}\n`;
      message += `   📅 ${date} | 🆔 ${doc.id.substring(0, 8)}...\n\n`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error listing files:", error);
    ctx.reply("❌ Có lỗi xảy ra!");
  }
});

// Delete document command
bot.command("delete", async (ctx) => {
  const docId = ctx.match;
  if (!docId) {
    return ctx.reply("❌ Sử dụng: /delete <doc_id>");
  }

  try {
    const from = ctx.from!;
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId)
      .eq("telegram_user_id", from.id);

    if (error) {
      console.error("Database error:", error);
      return ctx.reply("❌ Lỗi xóa tài liệu!");
    }

    ctx.reply("✅ Tài liệu đã được xóa thành công!");
  } catch (error) {
    console.error("Error deleting document:", error);
    ctx.reply("❌ Có lỗi xảy ra!");
  }
});

// Help command
bot.command("help", (ctx) => {
  ctx.reply(
    "🤖 UniShare Bot - Hướng dẫn sử dụng:\n\n" +
    "📤 Upload tài liệu:\n" +
    "   Gửi file trực tiếp với caption định dạng:\n" +
    "   'Tên trường - Ngành học - Mô tả'\n\n" +
    "🔍 Các lệnh:\n" +
    "   /start - Bắt đầu\n" +
    "   /get <file_id> - Tải file\n" +
    "   /myfiles - Xem file của bạn\n" +
    "   /delete <doc_id> - Xóa tài liệu\n" +
    "   /help - Hướng dẫn\n\n" +
    "💡 Truy cập website để tìm kiếm tài liệu!"
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Webhook handler
const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    if (secret !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("Unauthorized", { 
        status: 403,
        headers: corsHeaders 
      });
    }

    return await handleUpdate(req);
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});