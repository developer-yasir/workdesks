# WorkDesks - Role-Based Ticketing System

A complete internal ticketing system built with the MERN stack, featuring role-based access control for Super Admins, Company Managers, and Agents. Inspired by Freshdesk's enterprise ticketing solution.

## 🚀 Features

### Role-Based Access Control
- **Super Admin**: Full system access, user management, team management, global automation rules
- **Company Manager**: Team performance dashboard, ticket assignment, reporting & analytics, team automations
- **Agent**: Ticket inbox, reply/resolve tickets, private notes, canned responses

### Core Functionality
- ✅ JWT-based authentication with role-based permissions
- ✅ Ticket management (create, assign, update, resolve)
- ✅ Team/Group management
- ✅ Canned responses library
- ✅ Private notes for internal collaboration
- ✅ Automation rules and workflows
- ✅ File attachments support
- ✅ Advanced filtering and search
- ✅ Real-time notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

### Frontend
- **React** with React Router
- **Tailwind CSS** for styling
- **React-Quill** for rich text editing
- **Axios** for API calls
- **Recharts** for analytics visualization

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/developer-yasir/workdesks.git
cd workdesks
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/workdesks
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Run the Application**

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📁 Project Structure

```
workdesks/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & RBAC middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   └── public/
│
└── README.md
```

## 🔐 Default Credentials

After seeding the database, you can login with:

**Super Admin:**
- Email: admin@workdesks.com
- Password: admin123

**Company Manager:**
- Email: manager@workdesks.com
- Password: manager123

**Agent:**
- Email: agent@workdesks.com
- Password: agent123

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - Get tickets (role-filtered)
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/reply` - Add reply
- `POST /api/tickets/:id/notes` - Add private note

### Users (Admin/Manager)
- `POST /api/users` - Create user
- `GET /api/users` - Get users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Teams (Admin/Manager)
- `POST /api/teams` - Create team
- `GET /api/teams` - Get teams
- `PUT /api/teams/:id` - Update team

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Yasir**
- GitHub: [@developer-yasir](https://github.com/developer-yasir)

---

Built with ❤️ using the MERN Stack
