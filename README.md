# UniShare Bot 🎓

Nền tảng chia sẻ tài liệu học tập cho sinh viên thông qua Telegram Bot.

## ✨ Tính năng

- 📄 **Upload & Download** tài liệu qua Telegram Bot
- 🔍 **Tìm kiếm thông minh** theo trường, ngành, tags
- 👁️ **Preview file** ngay trên trình duyệt (PDF, images, videos, audio)
- 🏫 **Filter theo trường/ngành** để tìm tài liệu phù hợp
- 🏷️ **Tag system** để phân loại tài liệu
- 👤 **User management** với Supabase Auth
- 📱 **Responsive design** hoạt động trên mọi thiết bị

## 🚀 Demo

- **Live Demo**: [https://k23doanngocthanh.github.io/uni-share-bot/](https://k23doanngocthanh.github.io/uni-share-bot/)
- **Telegram Bot**: [@consenluutru_bot](https://t.me/consenluutru_bot)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth)
- **File Storage**: Telegram Bot API
- **Deployment**: GitHub Pages + GitHub Actions
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📦 Cài đặt & Chạy local

### Prerequisites

- Node.js 20+
- npm hoặc yarn
- Tài khoản Supabase
- Telegram Bot Token

### 1. Clone repository

```bash
git clone https://github.com/k23doanngocthanh/uni-share-bot.git
cd uni-share-bot
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Tạo file `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:8080](http://localhost:8080) để xem ứng dụng.

## 🏗️ Build & Deploy

### Build for production

```bash
npm run build
```

### Deploy to GitHub Pages

1. **Tự động**: Push code lên branch `main` → GitHub Actions sẽ tự động build và deploy
2. **Thủ công**: Chạy workflow manually từ GitHub Actions tab

### GitHub Pages Setup

1. Vào **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` / `/ (root)`

## 📁 Cấu trúc Project

```
uni-share-bot/
├── public/               # Static files
│   ├── .nojekyll        # Disable Jekyll for GitHub Pages
│   └── 404.html         # SPA routing fallback
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # External service integrations
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── services/      # Business logic services
├── .github/workflows/ # GitHub Actions
└── vite.config.ts     # Vite configuration
```

## 🔧 Configuration

### GitHub Actions Workflow

- **Trigger**: Push to `main` branch
- **Node.js**: Version 20
- **Actions**: All updated to latest v4
- **Deploy**: Automatic to GitHub Pages

## 📝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

## 👥 Authors

- **Đoàn Ngọc Thành** - [@k23doanngocthanh](https://github.com/k23doanngocthanh)

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cf981e7b-b574-43f6-bbb9-be4f3e01df34) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cf981e7b-b574-43f6-bbb9-be4f3e01df34) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
