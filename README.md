# AIHero - StudySidekickAI

An interactive AI-powered study assistant platform designed to provide personalized educational support to students while maintaining ethical use standards and teacher oversight.

## 🎯 Project Overview

AIHero transforms StudySidekickAI from a static prompt generator into a comprehensive learning platform featuring:

- **AI-Powered Interactions**: Real-time responses to student questions using GPT-4/Claude
- **Adaptive Learning**: Grade-level tailored explanations and content
- **Interactive Features**: Quizzes, flashcards, and story-based scenarios
- **Teacher Dashboard**: Class management, analytics, and student monitoring
- **Academic Integrity**: Built-in safeguards against plagiarism and misuse
- **Privacy Compliance**: COPPA, FERPA, and GDPR compliant data handling

## 📋 Project Structure

```
AIHero/
├── frontend/                 # React/Next.js frontend application
├── backend/                  # Node.js/Express backend server
├── database/                 # Database schemas and migrations
├── docs/                     # Documentation
├── .gitignore
├── README.md
└── ROADMAP.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+ (if using Python backend)
- PostgreSQL or Firebase

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## 📚 Development Phases

### Phase 1: Foundation & Core Infrastructure ✅ In Progress
- Project setup and structure
- Authentication system (local + OAuth2)
- Privacy & compliance framework

### Phase 2: AI Integration (Planned)
- Backend AI service integration
- Interactive chat interface
- Grade-level adaptive responses

### Phase 3: Interactive Learning (Planned)
- Quiz system
- Flashcard system
- Story-based scenarios

### Phase 4: Teacher Dashboard (Planned)
- Class management
- Analytics & progress tracking
- Custom rule configuration

### Phase 5: Safety & Safeguards (Planned)
- Academic integrity enforcement
- Request filtering & validation
- Audit logging & monitoring

## 🔐 Privacy & Compliance

AIHero is built with privacy-first principles:
- COPPA compliant for users under 13
- FERPA compliant for educational records
- GDPR compliant for EU users
- End-to-end encryption for sensitive data
- No training of third-party models on student data

See [COMPLIANCE.md](./docs/COMPLIANCE.md) for detailed information.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

TBD - To be determined

## 📧 Contact

For questions or feedback, contact the development team.
