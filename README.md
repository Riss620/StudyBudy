📚 StudyBudy

A full-stack study group and collaboration platform designed to help students connect, share files, discuss topics, receive notifications, and collaborate effectively in study communities.

🚀 Features
🧠 Core Functionality

User Authentication (Register & Login)

Secure password handling

Create, join, and leave study groups

Group-based discussions and comments

File upload and sharing within groups

Real-time notifications (messages, invites, uploads)

🛠️ Tech Stack

Frontend: React (Vite)
Backend: Node.js, Express
Database: MongoDB
Real-time Communication: Socket.io

📁 Project Structure

StudyBudy/
│
├── backend/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── .env.example
│ └── server.js
│
├── frontend/
│ ├── src/
│ ├── index.html
│ ├── vite.config.js
│ ├── .env.example
│ └── package.json
│
├── .gitignore
└── README.md

🔧 Installation & Setup
1️⃣ Clone the Repository

git clone https://github.com/Riss620/StudyBudy.git

cd StudyBudy

⚙️ Backend Setup
Install Dependencies

cd backend
npm install

Environment Variables

Create a .env file inside backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Start Backend Server

npm run dev

🌐 Frontend Setup
Install Dependencies

cd frontend
npm install

Environment Variables

Create a .env file inside frontend directory:

VITE_API_BASE_URL=http://localhost:5000/api

Start Frontend

npm run dev

🧪 Usage

Register or login as a user

Create or join a study group

Post discussions and replies

Upload and share files

Receive real-time notifications

🔐 Security Notes

Do NOT upload .env files to GitHub

Use .env.example for reference

Validate inputs on both client and server

🚧 Future Enhancements

Video & voice chat

Push notifications

Group calendar and reminders

Improved mobile responsiveness

👨‍💻 Author

Developed by Rishav Kumar
GitHub Repository: https://github.com/Riss620/StudyBudy
