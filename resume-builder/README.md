# Resume Builder

A modern, interactive resume builder built with React and Vite. Create professional resumes with live preview, PDF export, and AI-powered content suggestions.

## Features

- 🎨 Multiple professional templates
- 📱 Responsive design
- 🎯 Live preview with real-time editing
- 📄 High-quality PDF export
- 💾 Auto-save functionality
- 🎨 Customizable colors and fonts
- 📊 Import/Export resume data

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to [Netlify](https://netlify.com) or connect your repository.

### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init
```

3. Deploy:
```bash
firebase deploy
```

## Usage

1. Choose a template from the gallery
2. Fill in your personal information in the left sidebar
3. Customize colors, fonts, and layout
4. Edit content directly on the resume preview
5. Export as PDF or save your data

## AI Features

To use AI-powered features:
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter your API key in the app
3. Use features like:
   - Generate professional summaries
   - Improve existing content
   - Get skill suggestions
   - Create bullet point suggestions

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF, html2canvas
- **AI**: Google Generative AI

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
