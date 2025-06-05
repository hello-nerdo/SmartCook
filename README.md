# SmartCook 🍳

> Transform random ingredients into chef-quality meals with AI-powered recipe recommendations

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)

## 🎯 Vision

SmartCook solves the universal "what to cook tonight" dilemma by intelligently transforming whatever ingredients you have on hand—even sparse or unusual combinations—into delicious, chef-quality meals. Our AI-powered system considers your dietary preferences, skill level, and available ingredients to minimize food waste while maximizing culinary creativity.

### Core Problems We Solve

1. **Decision Fatigue**: Endless scrolling through recipe apps without finding something you can actually make
2. **Food Waste**: Ingredients expiring because you don't know what to do with them
3. **Limited Creativity**: Running out of ideas for ingredient combinations you already have
4. **Shopping Inefficiency**: Buying ingredients for specific recipes instead of maximizing what's available
5. **Dietary Restrictions**: Finding suitable meals that work with your preferences and limitations

## 🚀 Product Strategy

SmartCook operates with two complementary experiences:

### 1. **AI Recipe Engine** (Free Tier)
- Transform any ingredient combination into multiple recipe options
- Get chef-quality suggestions for unusual or limited ingredients
- Personalized recommendations based on dietary preferences and skill level
- Instant recipe generation from photos of your ingredients

### 2. **Smart Meal Planning** (Premium Subscription)
- Weekly meal plans optimized for minimal waste
- Automated shopping lists that build on ingredients you already have
- Batch cooking suggestions to maximize efficiency
- Integration with grocery delivery services

## 🛠 Technology Stack

### Core Framework
- **Next.js 15.2.3** - React framework with App Router
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5.5.2** - Full type safety throughout

### Infrastructure
- **Cloudflare Workers** - Serverless compute platform
- **Cloudflare D1** - Serverless SQL database
- **Cloudflare Images** - Optimized image storage and delivery
- **OpenNext.js** - Next.js adapter for Cloudflare deployment

### AI & APIs
- **OpenAI GPT-4** - Recipe generation and ingredient analysis
- **Image Analysis** - Ingredient recognition from photos

### Authentication & Security
- **Clerk** - User authentication and management
- **Middleware** - Route protection and user session handling

### Styling & UI
- **TailwindCSS** - Utility-first styling with custom design system
- **Framer Motion** - Smooth animations and transitions
- **Custom Color Palette** - Culinary-inspired warm orange, soft green, and charcoal

### Development Tools
- **ESLint** - Code linting with custom rules
- **Prettier** - Code formatting
- **Wrangler** - Cloudflare development CLI

## 🏗 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── core/           # Protected routes (requires auth)
│   │   ├── recipes/    # Recipe management
│   │   └── recipe/     # Individual recipe views
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # Reusable UI components
├── db/                 # Database layer
│   ├── setup/          # Schema and migrations
│   ├── seeds/          # Test data
│   └── types.ts        # Database schemas
├── lib/                # Shared utilities
│   ├── hooks/          # React hooks
│   └── types/          # TypeScript types
└── server/             # Server-side utilities
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18.0+ (required for Next.js 15)
- **npm** or **yarn**
- **Cloudflare account** (for deployment)
- **Clerk account** (for authentication)
- **OpenAI API key** (for AI features)

#### Node.js Version Management

This project requires **Node.js 18.18.0 or higher** to work with Next.js 15. We recommend using **nvm** (Node Version Manager) to easily switch between Node.js versions.

**Install nvm (macOS/Linux):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal or reload shell configuration
source ~/.zshrc  # or ~/.bashrc

# Install and use Node.js 20 LTS
nvm install 20
nvm use 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

**For Windows users:**
- Download Node.js 20 LTS from [nodejs.org](https://nodejs.org)
- Or use [nvm-windows](https://github.com/coreybutler/nvm-windows)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartCook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Cloudflare (for production)
   CLOUDFLARE_DATABASE_ID=your_d1_database_id
   ```

4. **Set up the database**
   ```bash
   # Create and seed local database
   npm run reset-db
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run preview` | Build and preview production locally |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run reset-db` | Reset local database |
| `npm run reset-db:prod` | Reset production database |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run pretty` | Format code with Prettier |
| `npm run types` | Type-check without emitting |

## 🎨 Design System

SmartCook uses a carefully crafted design system that embodies culinary creativity:

### Brand Colors
- **Warm Orange** (`#F28C38`) - Primary actions and inspiration
- **Soft Green** (`#A8D5BA`) - Freshness and sustainability  
- **Charcoal Black** (`#1A1A1A`) - Text and contrast
- **Clean White** (`#FFFFFF`) - Backgrounds and clarity
- **Warm Gray** (`#D3D3D3`) - Subtle elements

### Design Principles
1. **Creative & Inspiring** - Encourages culinary exploration
2. **Clear Visual Hierarchy** - Highlights key information
3. **Accessible & Intuitive** - Works for all skill levels
4. **Consistent Styling** - Predictable interactions
5. **Culinary-Oriented** - Resonates with food enthusiasts

## 🏛 Architecture Principles

### Code Placement
- **Shared**: `components/`, `db/`, `lib/`, `server/` - Reusable across features
- **Features**: `features/*/` - Feature-specific code with clear boundaries
- **App Routes**: `app/` - Pages and API routes
- **API Routes**: Only import shared modules, must use Zod schemas

### Data Flow
- **Server Components** - Default for data fetching
- **Client Components** - Only when needed for interactivity
- **API Routes** - RESTful endpoints with proper validation
- **Database** - Single source of truth with proper migrations

### Performance
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Pre-build when possible
- **Edge Runtime** - Global distribution via Cloudflare
- **Image Optimization** - Cloudflare Images for fast delivery

## 🧪 Development Workflow

### Code Quality
- **TypeScript Strict Mode** - Catches errors at compile-time
- **ESLint Boundaries** - Enforces architectural boundaries
- **Prettier** - Consistent code formatting
- **Zod Validation** - Runtime type safety for APIs

### Database Management
- **Migrations** - Version-controlled schema changes
- **Seeds** - Consistent test data
- **Local Development** - Isolated D1 database
- **Production** - Separate Cloudflare D1 instance

### Deployment
- **Automatic Builds** - Type-checking before deployment
- **Cloudflare Workers** - Serverless, globally distributed
- **Environment Variables** - Secure configuration management
- **Zero-Downtime** - Rolling deployments

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow the code style** (run `npm run lint` and `npm run pretty`)
4. **Test your changes** thoroughly
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- Follow the established file structure and naming conventions
- Use TypeScript strictly - no `any` types
- Write tests for complex business logic
- Ensure all API routes have proper Zod validation
- Follow the design system for UI components
- Optimize for mobile-first responsive design

## 📄 License

This project is proprietary software. All rights reserved.

## 🙋‍♂️ Support

For questions, issues, or feature requests:
- Create an issue in this repository
- Contact the development team
- Check our internal documentation

---

**Built with ❤️ for home cooks who want to waste less and cook more creatively** 