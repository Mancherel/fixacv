# fixacv

Privacy-first CV builder. Create professional CVs entirely in your browser.

All data stored locally. No signup required. Open source.

## Features (v0.1)

### Core Functionality

- **Personal Information** - Name, title, contact details
- **Profile Photo** - Upload and crop a square photo
- **Professional Statement** - Brief career summary
- **Work Experience** - Assignments and employment with dates, descriptions, and tags
- **Education** - Academic background
- **Graded Competencies** - Skills organized by proficiency level (Expert, Advanced, Proficient)
- **Languages & Other** - Languages and misc items (e.g., driver's license)
- **Preferences** - Work mode, availability, location preference
- **Certifications** - Courses and certifications (supports LinkedIn Courses.csv)
- **Portfolio** - Project links you want to showcase

### Data Management

- **Auto-save** - All changes automatically saved to browser localStorage
- **JSON Export/Import** - Backup and restore your data
- **LinkedIn Import** - Import your profile data from LinkedIn CSV exports
- **Smart Merge** - Import specific sections without overwriting others

### CV Preview & Export

- **Live A4 Preview** - See exactly how your CV will look
- **Professional Layout** - Sidebar design with 30/70 split
- **PDF Export** - Export your CV as PDF matching the preview
- **Page Break Protection** - Intelligent page breaks to avoid splitting content
- **Swedish + English** - Dates and duration in Swedish format

### User Experience

- **Section Visibility** - Show/hide entire sections
- **Drag & Drop Competencies** - Move skills between proficiency levels
- **Inline Editing** - Edit text directly with auto-save
- **Sticky Header** - Navigation stays visible while scrolling

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v4
- Vite
- localStorage (no backend)
- html2pdf.js for PDF export

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mancherel/fixacv.git
cd fixacv

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Feedback & Contributions

This is a personal project, but feedback is appreciated.

- ⭐ Star the repository if you find it useful
- 🐛 Report bugs via [Issues](https://github.com/Mancherel/fixacv/issues)
- 💡 Suggest features
- 🤝 Code contributions are welcome

## License

MIT License

---

Vibed with ❤️ by Mancherel
