# Discord Verification Bot Deployment Guide

## Railway Deployment

### Prerequisites
1. Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)
2. Supabase project with database tables created
3. Railway account

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and create new project
2. Choose "Deploy from GitHub repo" or "Empty project"
3. If using GitHub: Connect your repository
4. If using empty project: Upload the `bot/` folder

### Step 2: Configure Environment Variables
In Railway dashboard, add these variables:
\`\`\`
DISCORD_BOT_TOKEN=your_discord_bot_token_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
PORT=3000
\`\`\`

### Step 3: Set Root Directory
1. Go to Settings → Source
2. Set Root Directory to `bot`
3. Railway will auto-detect package.json and deploy

### Step 4: Database Setup
1. Run the SQL script in `scripts/001_create_discord_tables.sql` in your Supabase dashboard
2. Or use the v0 interface to run the script automatically

### Step 5: Discord Bot Setup
1. Go to Discord Developer Portal
2. Create new application → Bot
3. Copy bot token to Railway environment variables
4. Enable required intents: Server Members Intent, Message Content Intent
5. Generate invite link with Administrator permissions
6. Add bot to your Discord server

### Step 6: Bot Configuration
Once deployed and added to server:
1. Use `/setup channel #verification` to set verification channel
2. Use `/setup role @Verified` to set verified role
3. Use `/setup method button` or `/setup method code` for verification type
4. Use `/verify-panel` to create verification panel
5. Use `/stats` to view verification statistics

## Vercel Deployment (Admin Dashboard)
The Next.js admin dashboard can be deployed to Vercel:
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Deploy automatically

## Environment Variables Needed
- `DISCORD_BOT_TOKEN`: Your Discord bot token
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_ENV`: Set to "production"
- `PORT`: Railway will set this automatically

## Health Check
The bot includes a health check endpoint at `/health` for Railway monitoring.
