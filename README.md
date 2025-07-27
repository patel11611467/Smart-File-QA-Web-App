# Smart File QA Web App

## Description
A single-page web app where users can upload files, ask questions about them using AI, and export all Q&A into a PDF sent via email.

---

## Features
- Upload files (images, videos, PDFs, Word/Excel)
- Preview uploaded files in the browser
- Enter email & ask AI-powered questions
- Save data in SQLite database
- Export PDF & email it to the user

---

## Tech Stack
- Frontend: React
- Backend: Node.js (Express)
- Database: SQLite
- AI API: Together/OpenAI API

---

## Environment Variables
- Create `.env` file in root with:
- PORT=4000
- EMAIL_USER=
- EMAIL_PASS=
- TOGETHER_API_KEY=your_together_api_key


## Installation & Setup

### 1. Clone repo
- https://github.com/patel11611467/Smart-File-QA-Web-App
- cd Smart-File-QA-Web-App

### 2. Install backend
- cd backend
- npm install
- node index.js

### 3. Install frontend
- cd frontend
- npm install
- npm start

## Usage
1. Open `http://localhost:3000`
2. Upload file → enter email → ask questions
3. Export answers to PDF & send via email


