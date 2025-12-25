# Real Estate SaaS Platform

A comprehensive real estate SaaS platform with property listings, user authentication, and subscription-based membership.

## Features

### Core Features
- 🏠 Property Listings (Buy/Rent)
- 🔍 Advanced Search & Filters
- 👤 User Authentication (Login/Register)
- 💳 Subscription Plans (SaaS Model)
- 📊 User Dashboard
- ⭐ Featured Properties
- 📱 Responsive Design

### User Roles
- **Free Users**: Can post 1 property
- **Basic Members**: Can post 5 properties
- **Professional Members**: Can post 20 properties
- **Enterprise**: Can post 100 properties
- **Agents**: Can manage multiple properties
- **Admin**: Full platform management

### Subscription Plans
1. **Free** - $0/year - 1 property
2. **Basic** - $29/month - 5 properties
3. **Professional** - $79/month - 20 properties
4. **Enterprise** - $199/month - 100 properties

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19
- React Router v6
- Tailwind CSS
- Axios
- Lucide React (Icons)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created with default values):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realestatesaas
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

4. Start MongoDB (if using local):
```bash
mongod
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

### For Users
1. Register a new account
2. Login to your account
3. Browse properties
4. Add properties (based on your subscription)
5. Upgrade subscription for more features

### For Agents
1. Register with "Agent" role
2. Manage multiple properties
3. Track property views
4. Upgrade to higher tiers for more listings

### Admin Features
- View all users
- Manage properties
- Create subscription plans
- Monitor platform activity

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Properties
- GET `/api/properties` - Get all properties (with filters)
- GET `/api/properties/:id` - Get single property
- POST `/api/properties` - Create property (authenticated)
- PUT `/api/properties/:id` - Update property (owner/admin)
- DELETE `/api/properties/:id` - Delete property (owner/admin)
- GET `/api/properties/user/my-properties` - Get user's properties

### Subscriptions
- GET `/api/subscriptions/plans` - Get all plans
- POST `/api/subscriptions/plans` - Create plan (admin)
- POST `/api/subscriptions/subscribe/:planId` - Subscribe to plan
- GET `/api/subscriptions/my-subscription` - Get current subscription
- POST `/api/subscriptions/cancel` - Cancel subscription

### Users
- GET `/api/users` - Get all users (admin)
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/profile` - Update profile
- DELETE `/api/users/:id` - Delete user (admin)

## Project Structure

```
realstate/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Subscription.js
│   │   └── UserSubscription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── subscriptions.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── PropertyCard.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Properties.jsx
    │   │   ├── PropertyDetail.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AddProperty.jsx
    │   │   └── Subscriptions.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## Future Enhancements
- Image upload functionality
- Payment gateway integration (Stripe/PayPal)
- Email notifications
- Property comparison
- Saved/Favorite properties
- Real-time chat with agents
- Map integration
- Advanced analytics
- Mobile app

## License
ISC

## Support
For support, email support@realestatesaas.com
