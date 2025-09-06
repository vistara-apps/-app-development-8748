# LocalBites - Hyperlocal Meal Discovery App

**Discover, Plan, and Savor Meals Near You, Instantly.**

LocalBites is a hyperlocal meal discovery and planning app built as a Base mini-app, helping users find and decide what to eat based on their current location and preferences.

## 🚀 Features

### Core Features
- **Hyperlocal Meal Discovery**: Real-time view of available meals from nearby food vendors based on GPS location
- **Personalized Dietary Filtering**: Filter meals by dietary needs, allergies, cuisine preferences, and budget
- **Seamless Ordering Integration**: Direct links for ordering, reservations, and delivery/pickup information

### Premium Features (Subscription)
- **AI-Powered Recommendations**: Personalized meal suggestions using OpenAI
- **Advanced Meal Planning**: Weekly meal schedules and nutrition tracking
- **Unlimited Saved Locations**: Save and manage multiple favorite locations
- **Exclusive Restaurant Deals**: Special offers and discounts
- **Priority Customer Support**: Enhanced support experience
- **Offline Access**: Browse saved data without internet connection

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom glassmorphism design
- **State Management**: Zustand with persistence
- **Location Services**: Google Maps API
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **AI Features**: OpenAI API
- **Payments**: Stripe
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/-app-development-8748.git
   cd -app-development-8748
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in the `.env` file:
   - Supabase URL and anon key
   - Google Maps API key
   - OpenAI API key
   - Stripe publishable key

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:

```sql
-- Users table
CREATE TABLE users (
  userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fName TEXT NOT NULL,
  fUsername TEXT UNIQUE NOT NULL,
  preferredCuisines TEXT[] DEFAULT '{}',
  dietaryRestrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  budgetRange JSONB DEFAULT '{"min": 0, "max": 100}',
  savedLocations JSONB DEFAULT '[]',
  isSubscribed BOOLEAN DEFAULT false,
  subscriptionTier TEXT DEFAULT 'free',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  vendorId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  cuisineType TEXT NOT NULL,
  openingHours TEXT NOT NULL,
  contactInfo TEXT,
  website TEXT,
  orderLink TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  priceRange TEXT DEFAULT '$',
  isOpen BOOLEAN DEFAULT true,
  imageUrl TEXT
);

-- Menu Items table
CREATE TABLE menu_items (
  menuItemId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendorId UUID REFERENCES vendors(vendorId) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  dietaryTags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  imageUrl TEXT,
  isAvailable BOOLEAN DEFAULT true,
  nutritionInfo JSONB,
  preparationTime INTEGER
);

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to get nearby vendors
CREATE OR REPLACE FUNCTION get_nearby_vendors(
  lat DECIMAL,
  lng DECIMAL,
  radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE (
  vendorId UUID,
  name TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  cuisineType TEXT,
  openingHours TEXT,
  contactInfo TEXT,
  website TEXT,
  orderLink TEXT,
  rating DECIMAL,
  priceRange TEXT,
  isOpen BOOLEAN,
  imageUrl TEXT,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.vendorId,
    v.name,
    v.address,
    v.latitude,
    v.longitude,
    v.cuisineType,
    v.openingHours,
    v.contactInfo,
    v.website,
    v.orderLink,
    v.rating,
    v.priceRange,
    v.isOpen,
    v.imageUrl,
    ST_Distance(
      ST_Point(lng, lat)::geography,
      ST_Point(v.longitude, v.latitude)::geography
    ) / 1000 AS distance
  FROM vendors v
  WHERE ST_DWithin(
    ST_Point(lng, lat)::geography,
    ST_Point(v.longitude, v.latitude)::geography,
    radius_km * 1000
  )
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Create an API key and add it to your `.env` file

### Stripe Setup

1. Create a Stripe account
2. Set up subscription products:
   - Free tier (no payment required)
   - Premium tier ($5/month)
3. Add your publishable key to `.env`

## 🏗 Architecture

### State Management
The app uses Zustand for state management with the following stores:
- **User Store**: Authentication, user preferences, subscription status
- **Location Store**: Current location, saved locations, location services
- **Vendor Store**: Restaurant data, menu items, search filters
- **Notification Store**: App notifications and alerts
- **App Store**: UI state, theme, preferences
- **Meal Plan Store**: Premium meal planning features

### Services Layer
- **Supabase Service**: Database operations, real-time subscriptions
- **Maps Service**: Location detection, geocoding, distance calculations
- **OpenAI Service**: AI recommendations, meal planning, search suggestions
- **Stripe Service**: Payment processing, subscription management

### Custom Hooks
- **useLocation**: Location management and utilities
- **useVendors**: Restaurant and menu data management

## 🎨 Design System

The app uses a custom glassmorphism design with:
- **Colors**: Custom HSL color palette with primary orange accent
- **Typography**: Responsive text scales with proper hierarchy
- **Spacing**: Consistent spacing system (8px, 12px, 20px, 32px)
- **Shadows**: Layered shadow system for depth
- **Radius**: Rounded corners (6px, 10px, 16px, full)
- **Motion**: Smooth transitions with cubic-bezier easing

## 📱 Components

### Core Components
- **AppShell**: Main layout wrapper with glassmorphism background
- **LocationCard**: Restaurant display cards with menu preview
- **FilterTags**: Dynamic filtering system with emoji indicators
- **CallToActionButton**: Consistent button component with variants
- **LoadingSpinner**: Animated loading indicator

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key | No* |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No* |
| `VITE_STRIPE_PREMIUM_PRICE_ID` | Stripe premium price ID | No* |

*Optional for basic functionality, required for premium features

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Performance

The app is optimized for performance with:
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **Bundle Size**: Optimized with tree shaking and minification

## 🔒 Security

- **API Keys**: All sensitive keys are environment variables
- **Authentication**: Secure user authentication via Supabase
- **Data Validation**: Input validation on all forms
- **HTTPS**: All API calls use HTTPS
- **Content Security Policy**: Implemented for XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@localbites.app or join our Discord community.

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Restaurant dashboard
- [ ] Social features (reviews, sharing)
- [ ] Integration with delivery services
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Voice search
- [ ] AR menu viewing

---

Built with ❤️ for the Base ecosystem
