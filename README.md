# Symera - AI-Powered Event Management Platform

Symera is an intelligent event management platform designed to streamline team collaboration through sophisticated task management and financial planning. The application features a mobile-first, responsive design with a focus on enhanced user experience.

## 🚀 Features

- **AI-Assisted Planning**: Intelligent task prioritization and tracking
- **Collaborative Task Management**: Real-time collaborative task planning features
- **Financial Planning**: Budget tracking and vendor management
- **Mobile-First Design**: Responsive UI with context-aware navigation
- **Multiple Event Types**: Support for weddings, birthdays, corporate events, conferences, and more
- **Internationalization**: Portuguese language support
- **Dynamic Visualization**: Event format tracking and visualization
- **Advanced Filtering**: Powerful filtering and sorting capabilities for events and tasks

## 📋 Technical Stack

### Frontend
- **React**: Core UI library
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components built on Radix UI
- **Wouter**: Lightweight routing for React
- **TanStack Query (React Query)**: Data fetching and state management
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation
- **Framer Motion**: Animations and transitions

### Backend
- **Express.js**: Web server framework
- **Drizzle ORM**: Database ORM for PostgreSQL
- **PostgreSQL**: Relational database
- **Passport.js**: Authentication middleware
- **Replit Auth**: Authentication integration

## 🗄️ Database Schema

The application uses a PostgreSQL database with Drizzle ORM. Key entities include:

- **Users**: User accounts and profiles
- **Events**: Event details including type, format, date, and location
- **Tasks**: Tasks associated with events
- **Team Members**: Collaborators for events
- **Vendors**: Service providers for events
- **Budget Items**: Financial planning for events

## 📁 Project Structure

```
/
├── client/               # Frontend code
│   ├── src/
│   │   ├── assets/       # Images and static assets
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   └── index.html        # HTML template
├── server/               # Backend code
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   ├── index.ts          # Server entry point
│   ├── replitAuth.ts     # Replit authentication
│   └── openai.ts         # OpenAI integration
├── shared/               # Shared code between frontend and backend
│   ├── schema.ts         # Database schema definitions
│   └── types.ts          # TypeScript type definitions
├── .replit               # Replit configuration
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Project dependencies
└── vite.config.ts        # Vite bundler configuration
```

## 🚀 Running the Project

### Development

1. Ensure you have Node.js installed (v18 or newer recommended)
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   This will start both the backend Express server and the frontend Vite development server.

### Database Management

To apply schema changes to the database:

```
npm run db:push
```

Note: Always use the ORM for database operations rather than writing raw SQL.

## 📱 Mobile and Responsive Design

Symera is designed to be mobile-first with responsive layouts:
- Adaptive sidebar that transforms into a bottom navigation bar on mobile
- Context-aware navigation based on screen size
- Touch-friendly UI elements
- Optimized forms and interactions for mobile devices

## 🔧 API Structure

The API follows RESTful conventions with the following primary endpoints:

- `/api/auth/*`: Authentication endpoints
- `/api/events/*`: Event management endpoints
- `/api/tasks/*`: Task management endpoints
- `/api/team/*`: Team management endpoints
- `/api/vendors/*`: Vendor management endpoints
- `/api/budget/*`: Budget management endpoints

## 👥 Authentication

The application uses Replit Auth for production and a dev authentication mode for development. Authentication state is managed through session cookies.

## 📊 Data Visualization

Event progress and statistics are visualized through:
- Progress indicators
- Task completion charts
- Budget allocation visualization
- Time-based event scheduling

## 🚀 Deployment

The application is configured for deployment on Replit. To deploy:

1. Build the application:
   ```
   npm run build
   ```
2. Start the production server:
   ```
   npm run start
   ```

## 📝 Development Guidelines

- Update the database schema in `shared/schema.ts` when adding new data models
- Use React Query for data fetching in the frontend
- Follow the established component structure for consistency
- Implement form validation using Zod schemas
- Keep the codebase modular and maintainable
- Use shadcn components for UI consistency

## 🌐 Environment Variables

The following environment variables are used:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development or production)
- `OPENAI_API_KEY`: For AI-assisted features (optional)

## ⚙️ Dependencies

See `package.json` for the complete list of dependencies.

## 📅 Last Updated

May 23, 2025

---

© 2025 Symera. All Rights Reserved.