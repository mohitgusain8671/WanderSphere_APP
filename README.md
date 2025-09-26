# WanderSphere - Travel Social Media App

A comprehensive React Native travel social media application built with Expo, featuring authentication, dark/light themes, and a beautiful UI designed for travel enthusiasts.

## 🌟 Features

### Authentication System
- ✅ User Registration with Email Verification
- ✅ Secure Login with JWT Tokens
- ✅ Password Reset with OTP
- ✅ Persistent Authentication State
- ✅ Role-based Access (User/Admin)

### UI/UX Features
- ✅ Dark/Light Theme Support
- ✅ Beautiful Travel-themed Design
- ✅ Responsive Layout
- ✅ Smooth Animations
- ✅ NativeWind (Tailwind CSS) Styling

### App Structure
- ✅ Welcome/Onboarding Screen
- ✅ Authentication Flow (Login/Register/Forgot Password)
- ✅ User Dashboard with Travel Features
- ✅ Admin Dashboard (for admin users)
- ✅ Profile Management
- ✅ Theme Toggle

## 📱 Screenshots

*Coming Soon - Add screenshots of your app here*

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update `utils/constants.ts` with your backend URL
   - Ensure backend server is running on `http://localhost:5000`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
MyApp/
├── app/                          # App Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main app screens
│   │   ├── index.tsx             # Home screen
│   │   ├── explore.tsx           # Explore destinations
│   │   ├── stories.tsx           # Travel stories
│   │   ├── admin.tsx             # Admin dashboard
│   │   ├── profile.tsx           # User profile
│   │   └── _layout.tsx
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Welcome screen
├── components/                   # Reusable components
│   └── ui/                       # UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── LoadingSpinner.tsx
├── contexts/                     # React contexts
│   └── ThemeContext.tsx
├── store/                        # Zustand store
│   ├── index.js
│   └── slices/
│       ├── auth-slice.js
│       └── theme-slice.js
├── utils/                        # Utility functions
│   ├── constants.ts              # App constants
│   ├── api.ts                    # API client
│   ├── validation.ts             # Form validation
│   └── helpers.ts                # Helper functions
├── global.css                    # Global styles
├── tailwind.config.js            # Tailwind configuration
└── package.json
```

## 🎨 Theme System

The app supports both light and dark themes with automatic persistence:

### Light Theme
- Background: White (#FFFFFF)
- Surface: Light Gray (#F8FAFC)
- Text: Dark Gray (#1F2937)
- Primary: Blue (#3B82F6)

### Dark Theme
- Background: Dark Blue (#0F172A)
- Surface: Slate (#1E293B)
- Text: Light Gray (#F1F5F9)
- Primary: Blue (#3B82F6)

## 🔐 Authentication Flow

### Registration
1. User enters personal details
2. Backend validates and creates account
3. Verification email sent
4. User redirects to login after email verification

### Login
1. User enters email/password
2. Backend validates credentials
3. JWT tokens returned and stored securely
4. User redirected to main app

### Password Reset
1. User enters email
2. OTP sent to email
3. User enters OTP and new password
4. Password updated, user redirected to login

## 🏗 State Management

Using Zustand for state management with the following slices:

### Auth Slice
- User information
- Authentication tokens
- Loading states
- Auth actions (login, register, logout, etc.)

### Theme Slice
- Theme preference (light/dark)
- Theme toggle functionality
- Persistent theme storage

## 📱 Screens Overview

### Authentication Screens
- **Welcome**: App introduction and navigation to auth
- **Login**: Email/password login with theme toggle
- **Register**: User registration with validation
- **Forgot Password**: Email input for password reset
- **Reset Password**: OTP and new password input

### Main App Screens
- **Home**: Dashboard with travel features and user info
- **Explore**: Discover destinations (placeholder for future features)
- **Stories**: Travel stories sharing (placeholder for future features)
- **Profile**: User profile and settings
- **Admin**: Admin dashboard (only for admin users)

## 🔧 Configuration

### API Configuration
Update `utils/constants.ts`:
```typescript
export const HOST = 'your-backend-url';
export const API_BASE_URL = `${HOST}/api`;
```

### Theme Colors
Customize colors in `utils/constants.ts`:
```typescript
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  // ... other colors
};
```

## 📦 Dependencies

### Core Dependencies
- **expo**: Expo framework
- **react-native**: React Native framework
- **expo-router**: File-based routing
- **zustand**: State management
- **axios**: HTTP client
- **nativewind**: Tailwind CSS for React Native

### UI Dependencies
- **@expo/vector-icons**: Icon library
- **expo-secure-store**: Secure storage
- **react-native-safe-area-context**: Safe area handling

## 🚧 Future Features

### Planned Features
- [ ] Interactive map for destinations
- [ ] Photo/video story sharing
- [ ] Real-time chat with travel buddies
- [ ] Trip planning and itinerary
- [ ] Location-based recommendations
- [ ] Social features (follow, like, comment)
- [ ] Push notifications
- [ ] Offline support

### Admin Features
- [ ] User management
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] System monitoring

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 📱 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**WanderSphere** - Explore. Share. Connect. 🌍✈️