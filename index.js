import express from 'express';
import dotenv from 'dotenv';
import AuthRoutes from './routes/Auth.routes.js';
import DbCon from './libs/db.js';

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

DbCon();
app.use(express.json());

// ✅ Base route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// ✅ Auth route
app.use('/auth', AuthRoutes);

app.listen(PORT, () => {
    console.log(`App is running on Port ${PORT}`);
});
