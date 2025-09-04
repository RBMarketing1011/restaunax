# Restaunax - Order Management Dashboard

A modern, responsive restaurant order management system built with Next.js 14, TypeScript, Material UI, and PostgreSQL.

## 🚀 Features

- **Real-time Order Dashboard**: View orders organized by status (Pending, Preparing, Ready, Delivered)
- **Order Management**: Update order status with a single click
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Material UI Components**: Beautiful, accessible UI components
- **RESTful API**: Clean API endpoints for order operations
- **PostgreSQL Database**: Robust data storage with Prisma ORM
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **UI Library**: Material UI v6, Emotion (CSS-in-JS)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Development**: ESLint, Hot Reload

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🏗️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaunax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Ensure PostgreSQL is running on your system
   - Create a database named `test` (or update the connection string)
   - Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://admin:test@123@localhost:5432/test"
   ```

4. **Initialize Database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
restaunax/
├── src/
│   ├── app/
│   │   ├── api/orders/          # API routes for order management
│   │   ├── components/          # Reusable UI components
│   │   ├── layout.tsx           # Root layout with theme provider
│   │   └── page.tsx             # Main dashboard page
│   ├── lib/
│   │   └── prisma.ts            # Prisma client configuration
│   └── types/
│       └── order.ts             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding script
├── .env                         # Environment variables
└── package.json
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Fetch all orders (optional status filter) |
| GET | `/api/orders/[id]` | Fetch specific order by ID |
| POST | `/api/orders` | Create new order |
| PATCH | `/api/orders/[id]` | Update order status |

### Example API Usage

**Get all orders:**
```bash
curl http://localhost:3000/api/orders
```

**Filter by status:**
```bash
curl http://localhost:3000/api/orders?status=pending
```

**Update order status:**
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

**Create new order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "orderType": "delivery",
    "total": 25.99,
    "items": [
      {
        "name": "Margherita Pizza",
        "quantity": 1,
        "price": 18.99
      },
      {
        "name": "Garlic Bread",
        "quantity": 1,
        "price": 7.00
      }
    ]
  }'
```

## 💾 Database Schema

### Orders Table
- `id`: Unique identifier (CUID)
- `customerName`: Customer's name
- `orderType`: 'delivery' or 'pickup'
- `status`: 'pending', 'preparing', 'ready', or 'delivered'
- `total`: Order total amount
- `createdAt`: Order creation timestamp
- `updatedAt`: Last update timestamp

### Order Items Table
- `id`: Unique identifier (CUID)
- `name`: Item name
- `quantity`: Item quantity
- `price`: Item unit price
- `orderId`: Foreign key to orders table

## 🎨 UI Features

- **Status Tabs**: Orders organized by status with counts
- **Order Cards**: Clean, informative order displays
- **Order Details Modal**: Detailed view with action buttons
- **Status Workflow**: Intuitive status progression (Pending → Preparing → Ready → Delivered)
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Graceful error messages and recovery

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npm run db:migrate    # Run migrations
npm run db:seed       # Seed sample data
npm run db:studio     # Open Prisma Studio
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   - Update `DATABASE_URL` in production environment
   - Run migrations: `npm run db:migrate`

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Railway, Heroku, or any Node.js hosting service

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Customization Options
- **Theme Colors**: Modify theme in `src/app/components/ThemeProvider.tsx`
- **Order Statuses**: Update enums in `prisma/schema.prisma` and `src/types/order.ts`
- **UI Components**: Customize Material UI components in the theme provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Implementation Notes

### Architecture Decisions
- **Next.js App Router**: Leverages the latest Next.js features for better performance
- **API Routes**: Built-in API functionality eliminates need for separate backend
- **Prisma ORM**: Type-safe database operations with excellent developer experience
- **Material UI**: Provides consistent, accessible, and customizable components
- **PostgreSQL**: Robust relational database suitable for production use

### Challenges Overcome
- **Real-time Updates**: Implemented manual refresh functionality (WebSocket integration would be a future enhancement)
- **Mobile Responsiveness**: Used Material UI's responsive utilities and breakpoints
- **State Management**: React hooks provide sufficient state management for this scope
- **Error Handling**: Comprehensive error boundaries and user feedback

### Future Enhancements
- Real-time updates with WebSockets or Server-Sent Events
- User authentication and role-based access
- Order analytics and reporting dashboard
- Integration with payment systems
- Push notifications for status updates
- Advanced filtering and search capabilities
- Print functionality for kitchen orders

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material UI team for the excellent component library
- Prisma team for the fantastic ORM
- Next.js team for the robust framework
