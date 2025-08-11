# MongoDB Setup Guide for MRC Foods

## Quick Setup

### Option 1: Start MongoDB Service (Recommended)
1. **Run PowerShell as Administrator**
2. Execute: `net start MongoDB`
3. If successful, run: `npm run backend:seed`

### Option 2: Manual MongoDB Start
1. Create data directory: `mkdir C:\data\db` (if it doesn't exist)
2. Start MongoDB manually: `mongod --dbpath "C:\data\db"`
3. In another terminal, run: `npm run backend:seed`

### Option 3: Use MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get connection string
3. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mrc_foods
   ```
4. Run: `npm run backend:seed`

## Verification

Once MongoDB is running, you should see:
```
📊 Connected to MongoDB: localhost
🍽️ Menu items created
👥 Default users created
🎉 Database seeded successfully!
```

## Default Login Credentials

After seeding:
- **Admin**: admin@mrcfoods.com / password123
- **Staff**: staff@mrcfoods.com / password123  
- **Student**: student@mrcfoods.com / password123

## Troubleshooting

### "Access Denied" Error
- Run PowerShell/Command Prompt as Administrator
- Or use manual start method

### "Data Directory Not Found"
```bash
mkdir C:\data\db
mongod --dbpath "C:\data\db"
```

### "MongoDB Not Found"
- Install MongoDB from [official site](https://www.mongodb.com/try/download/community)
- Or use MongoDB Atlas (cloud option)

## Running the Full Application

Once MongoDB is set up:
```bash
npm run dev:full
```

This starts:
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
