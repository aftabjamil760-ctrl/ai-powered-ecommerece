# AI-Powered MERN E-Commerce Platform

A full-stack e-commerce solution built with the MERN stack, featuring secure authentication, product management, order processing, payments, analytics, and an AI-powered shopping assistant that helps customers discover products faster.

## 🚀 Live Demo

Live URL:
(https://youtu.be/BopQiD2b2BA?si=n0SB3y4p0r2EmWiz)



## 📌 Project Overview

This project solves the challenge of modern online retail by combining a robust storefront with intelligent customer support. It enables businesses to present products, process orders, manage customers, and provide conversational product discovery through an AI assistant. The platform is designed for both end users and administrators, offering a scalable architecture that can support real-world e-commerce operations.

The solution is ideal for online retailers, startups, and service-based businesses that want a polished digital shopping experience with automation, analytics, and AI-driven user engagement.

## 🎯 Requirements / Project Goals

### Functional Requirements

The system should allow users to:

- Create and verify an account
- Log in securely using email/password or Google OAuth
- Browse and search products
- View product details and related recommendations
- Add items to cart and place orders
- Complete payments through Stripe
- Interact with an AI chatbot for product guidance
- View order history and account activity
- Access admin features for product and order management

### Non-Functional Requirements

The application should provide:

- Responsive and mobile-friendly UI
- Secure authentication and protected routes
- Fast and reliable API responses
- Scalable backend architecture
- Reliable database operations and error handling
- Clear user experience for both customers and administrators

## 🏗️ System Design / Architecture

The application follows a modular full-stack architecture with a decoupled frontend and backend.

```text
Client (React + Vite)
        |
        |
   REST API / JWT Auth
        |
        |
Node.js + Express.js
        |
        |
MongoDB Atlas / Mongoose
```

### Architecture Components

Frontend:
- React.js
- Vite
- React Router
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express.js
- RESTful API architecture
- JWT-based authentication
- Middleware for validation and protection

Database:
- MongoDB
- Mongoose ODM

AI Layer:
- RAG-based chatbot
- Product embeddings
- Semantic product search and conversational recommendations

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Passport.js
- Stripe SDK

### Database

- MongoDB
- Mongoose ODM

### Authentication & Security

- JWT
- bcryptjs
- Google OAuth
- Protected routes
- Environment-based configuration

### Deployment

- Vercel or Netlify for frontend
- Render / AWS EC2 / Railway for backend
- MongoDB Atlas for database hosting

## ✨ Features

### User Features

✅ Secure registration and login  
✅ Google OAuth sign-in  
✅ Product browsing and search  
✅ Product details and recommendations  
✅ Cart and checkout flow  
✅ Stripe-powered payment processing  
✅ AI shopping assistant for product discovery  
✅ Order tracking and user account management  

### Admin Features

✅ Admin dashboard access  
✅ Product management  
✅ Order management  
✅ Analytics and reporting  
✅ Notification and feedback management  

### Technical Features

✅ RESTful API design  
✅ Input validation and error handling  
✅ Secure password hashing  
✅ Scalable modular folder structure  
✅ Embedding-based AI recommendations  
✅ Deployment-ready configuration  

## 🔐 Security Implementation

Security was implemented as a core part of the system rather than an afterthought. The platform uses:

- Password hashing with bcryptjs
- JWT-based authentication for protected routes
- Role-based access for admin operations
- Environment variables for API secrets and configuration
- Secure payment integration using Stripe
- Input validation to reduce malformed requests and abuse

## 📂 Project Structure

```text
ecommerence-store/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── chatbot/
│   ├── services/
│   └── utils/
│
├── README.md
└── package.json
```

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ecommerence-store.git
cd ecommerence-store
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available locally through Vite, and the backend will run through Express.

## 🔌 API Documentation

### Authentication API

#### Register User

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### Login User

```http
POST /api/auth/login
```

#### Google OAuth

```http
GET /auth/google
```

### Product API

```http
GET /api/products
GET /api/products/:id
```

### Order API

```http
POST /api/orders
GET /api/orders/:id
```

### AI Chatbot API

```http
POST /api/chatbot/message
```

## 🧪 Testing

Testing performed during development included:

- Authentication flow testing
- Product and order API validation
- Payment integration checks
- AI chatbot response evaluation
- Responsive UI testing across common screen sizes

## 🚀 Deployment

### Frontend

- Build the React application
- Deploy to Vercel or Netlify

### Backend

- Deploy Node.js API on Render, AWS EC2, or Railway
- Configure environment variables securely

### Database

- Use MongoDB Atlas for production-grade database hosting

## 📈 Future Improvements

Possible enhancements for the next iteration:

- Real-time order notifications
- Advanced analytics dashboards
- Personalized recommendations using user behavior
- Mobile app version
- Admin workflow automation

## 👨‍💻 Developer

Aftab Jamil

MERN Stack Developer

Portfolio: https://aipoweredecommerecevercelapp.vercel.app/

GitHub: (https://github.com/aftabjamil760-ctrl/ai-powered-ecommerece)

## ⭐ Support

If you like this project, consider giving it a star on GitHub.
