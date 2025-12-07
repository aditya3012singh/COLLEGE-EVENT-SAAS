**College Events SaaS Platform**

A full-stack SaaS platform for managing college events, clubs, registrations, and payments. Supports multi-college onboarding with separate admin panels.

**Features
Admin Features**

Create, edit, publish, and delete events

Manage clubs, categories, registrations, and payments

Dashboard with analytics for events, revenue, and participants

Approve or reject event proposals

Export registration details

Manage student and staff roles

**Student Features**

View upcoming, ongoing, and past events

Event detail pages with posters, description, venue, timings, and fees

Register for free or paid events

Online payment integration

View registration history

Join clubs and participate

Update profile
**
SaaS Platform Features**

Multi-college support

Each college receives its own admin portal

College onboarding system

Subscription plan support
**
Tech Stack
Backend**

Node.js

Express.js

PostgreSQL

Prisma ORM

JWT Authentication

Multer or Cloud Storage

Razorpay or Stripe (optional)
**
Frontend**

React or Next.js

Redux Toolkit

TailwindCSS

**Axios

DevOps
**
Docker 

Render, Railway, or Vercel for deployment
**
Project Structure**
root/
 ├── backend/
 │    ├── src/
 │    │    ├── routes/
 │    │    ├── controllers/
 │    │    ├── prisma/
 │    │    ├── middlewares/
 │    │    ├── utils/
 │    ├── package.json
 │    └── README.md

 ├── frontend/
 │    ├── src/
 │    │    ├── pages/
 │    │    ├── components/
 │    │    ├── redux/
 │    │    ├── services/
 │    ├── package.json
 │    └── README.md

 └── README.md

**Setup Instructions**
1. Clone the Repository
git clone https://github.com/yourname/college-events-saas.git
cd college-events-saas

2. Install Backend Dependencies
cd backend
npm install

3. Create .env File
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
CLOUD_KEY="..."
RAZORPAY_KEY="..."
RAZORPAY_SECRET="..."

4. Prisma Setup
npx prisma migrate dev
npx prisma generate

5. Install Frontend Dependencies
cd ../frontend
npm install

6. Start Development Servers

Frontend

npm run dev


Backend

npm start

Future Improvements

Theme customization per college

QR-based check-in system

Email and SMS notifications

AI-generated event recommendations

Advanced admin dashboards

**Contributing**

Pull requests are welcome.
For major changes, please open an issue before starting.
