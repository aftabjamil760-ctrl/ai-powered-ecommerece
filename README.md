# AI-Powered E-Commerce Platform

A concise academic README for a MERN commerce system with dual chatbot workflows.

## 1. PROJECT OVERVIEW

| Aspect | Description |
|--------|-------------|
| **Purpose** | Full-stack e-commerce with AI chat, secure checkout, order tracking, and admin analytics. |
| **Architecture** | React/Vite client → Express API → MongoDB + vector store, with separate chat and payment services. |
| **Pattern** | MVC-inspired backend, services for business logic, and reusable React components. |
| **Stack** | React, Node.js, Express, MongoDB, Mongoose, Stripe, LangChain, Hugging Face/Ollama, JWT. |

## 2. RESEARCH AND DESIGN RATIONALE

- React + Vite: fast SPA performance and modern dev workflow.
- Express: middleware-driven routing and API orchestration.
- MongoDB: flexible schema for products, orders, chat memory, and analytics.
- LangChain/vector search: semantic retrieval for grounded chatbot answers.
- Stripe: secure global payment workflow with webhook validation.
- JWT + Passport: stateless authentication and OAuth integration.
- Role-based routing: separate customer and admin authorization.
- Service layer: isolates payments, AI, notifications, and analytics.
- Persistent chat memory: multi-turn conversation context in MongoDB.
- Vector search: semantic product discovery beyond keyword matching.

## 3. SYSTEM ARCHITECTURE

Browser → React SPA → Express API → MongoDB / Vector Store

```
Browser (React/Vite)
  ↓
Express Server
  ├─ middleware (auth, roles, errors)
  ├─ controllers
  ├─ services (payments, AI, email, analytics)
  └─ chatbot subsystem
  ↓
MongoDB collections + vector index
```

Request Lifecycle Example:
1. User logs in and receives JWT.
2. React requests `/api/products`.
3. Backend fetches from MongoDB.
4. User asks chatbot for "summer wedding outfit under $50." 
5. RAG service retrieves relevant products.
6. LLM returns grounded chat response.

## 4. REPOSITORY STRUCTURE

### Backend Architecture

| Layer | File Name | Responsibility |
|-------|-----------|----------------|
| Config | `config/database.js` | MongoDB connection and pool management |
| Config | `config/passport.js` | Google OAuth and auth configuration |
| Model | `models/User.js` | User auth, roles, verification |
| Model | `models/Product.js` | Product catalog, pricing, inventory |
| Model | `models/Order.js` | Order lifecycle and status |
| Model | `chatbot/models/ChatSession.js` | Chat session persistence |
| Model | `chatbot/models/ChatMessage.js` | Message history storage |
| Controller | `controllers/authController.js` | Auth and token handling |
| Controller | `controllers/productController.js` | Product CRUD and listing |
| Controller | `controllers/orderController.js` | Order creation and updates |
| Controller | `chatbot/controllers/chatbotController.js` | Chat send, history, and session operations |
| Script | `scripts/seed.js` | Seed database and sample data |
| Script | `chatbot/scripts/seedProducts.js` | Product seeding and vector indexing |

### Frontend Layout

| Viewport / Component | File Name | UI Purpose |
|----------------------|-----------|-------------|
| Root | `src/App.jsx` | App shell, routing, providers |
| Page | `src/pages/Products.jsx` | Catalog browsing and filtering |
| Page | `src/pages/ProductDetails.jsx` | Product details and purchase flow |
| Page | `src/pages/Checkout.jsx` | Checkout and payment forms |
| Page | `src/pages/Orders.jsx` | Order history and status tracking |
| Page | `src/pages/Analytics.jsx` | Admin metrics and revenue charts |
| Component | `src/components/Chatbot.jsx` | Conversational chat interface |
| Component | `src/components/ProductCard.jsx` | Product preview card |
| Component | `src/components/FeedbackForm.jsx` | Rating and review input |
| Service | `src/services/ChatbotService.js` | Chat API client and session state |
| Context | `src/context/AuthContext.jsx` | Global auth state management |

## 5. CORE SYSTEM INTEGRATION & DUAL CHATBOT SPLITTING

- **Shopping Bot (Customer)**: vector search, order tracking, recommendations, RAG with Ollama/Hugging Face, and session memory.
- **Admin Analytics Bot**: sales/revenue queries, inventory alerts, feedback sentiment, and review summarization.
- Split by endpoint and role: `/chatbot/message/customer` vs `/chatbot/message/admin`.
- Role middleware enforces shopping-focused customer flow and analytics-focused admin flow.
- Customer bot returns grounded product/order guidance; admin bot returns business intelligence.

## 6. IMPLEMENTATION STEPS (10-STEP DEVELOPMENT TIMELINE)

1. Initialize React/Vite frontend and Express backend.
2. Configure `.env`, MongoDB, and JWT auth middleware.
3. Model Users, Products, Orders, Payments, Feedback, ChatSession, and ChatMessage.
4. Implement auth, product, order, payment, feedback, notification controllers.
5. Add Stripe payment intent creation, confirmation, webhook handling.
6. Create chatbot memory services, session persistence, and vector index integration.
7. Integrate LangChain / Hugging Face for retrieval-augmented generation.
8. Build frontend pages, protected routes, and admin dashboard components.
9. Connect chat UI to customer/admin endpoints with role-based session handling.
10. Test end-to-end checkout, chat workflows, analytics, and seeded data.

## 7. ENVIRONMENT VARIABLES & HOW TO RUN LOCALLY

```env
MONGODB_URI=<your_mongo_uri>
JWT_SECRET=<jwt_secret>
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
FRONTEND_URL=http://localhost:5173
HUGGING_FACE_API_KEY=<huggingface_api_key>
```

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## 8. SUMMARY FOR ACADEMIC SUBMISSION

This project addresses the need for an integrated e-commerce platform with AI-guided shopping and analytics. The methodology combines MERN architecture, vector search, and RAG to ground chatbot responses in real product and order data. Technical highlights include Stripe integration, local RAG vector processing, and dynamic role switching for customer versus admin chatbot capabilities.
