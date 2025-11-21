# CropGuard AI 🌾

**Smart Pest Detection System with AI-Powered Analysis and Weather-Based Risk Alerts**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-vercel-url.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Overview

CropGuard AI is an intelligent agricultural platform that combines artificial intelligence with real-time weather monitoring to help farmers detect crop pests and diseases early. The system provides instant analysis through camera capture or image upload, delivering actionable insights and preventive measures to protect your crops.

## ✨ Features

- **📸 Live Camera Capture**: Take photos directly from your mobile device using native camera access
- **🤖 AI-Powered Pest Detection**: Advanced image analysis to identify pests and diseases with confidence scores
- **🌤️ Weather-Based Risk Alerts**: Real-time weather monitoring for pest outbreak predictions
- **📍 Location-Aware**: Automatic geolocation for localized weather and pest risk analysis
- **💡 Smart Recommendations**: Detailed treatment plans and preventive measures
- **📱 Mobile-First Design**: Fully responsive interface optimized for field use
- **⚡ Real-Time Analysis**: Instant results powered by Supabase Edge Functions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Edge Functions, Database)
- **AI Integration**: Google Gemini API for image analysis
- **Weather Data**: OpenWeather API
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key
- OpenWeather API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/suman-X/my-farma-easy.git
cd my-farma-easy
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configure Supabase Edge Functions**

Set up the following secrets in Supabase:
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set OPENWEATHER_API_KEY=your_openweather_api_key
```

5. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Mobile Testing

### Android
1. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Ensure phone is on same WiFi network
3. Visit `http://YOUR_IP:5173` in mobile browser
4. Allow camera permissions when prompted

### iOS
- Requires HTTPS for camera access
- Use ngrok or similar service to tunnel with SSL:
```bash
npx ngrok http 5173
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
   - Import your GitHub repository in Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Configure Supabase Edge Functions**
   - Deploy functions: `supabase functions deploy analyze-pest`
   - Deploy weather function: `supabase functions deploy get-weather-alert`

## 📂 Project Structure

```
plant-guard-ai-main/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── NavLink.tsx
│   ├── pages/            # Page components
│   │   ├── Index.tsx     # Main application page
│   │   └── NotFound.tsx
│   ├── integrations/     # External service integrations
│   │   └── supabase/
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── analyze-pest/
│   │   └── get-weather-alert/
│   └── config.toml
└── public/               # Static assets
```

## 🎯 Usage

1. **Weather Alerts**
   - Allow location permissions
   - View real-time pest risk based on weather conditions
   - Get preventive recommendations

2. **Pest Detection**
   - Click "Take Photo" to open camera
   - Capture image of affected crop
   - Or upload existing image from gallery
   - Click "Analyze Crop" for AI analysis
   - Review detection results and recommendations

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to Supabase secrets

### OpenWeather API
1. Sign up at [OpenWeather](https://openweathermap.org/api)
2. Get your API key
3. Add to Supabase secrets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Weather data from [OpenWeather](https://openweathermap.org/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

## 📧 Support

For support, email support@cropguard-ai.com or open an issue in the repository.

---

**Made with ❤️ for farmers worldwide**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f0384846-27b4-494d-acb6-7f655fcbbbec) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
