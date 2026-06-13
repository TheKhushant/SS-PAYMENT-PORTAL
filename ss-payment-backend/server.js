require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const dns = require('dns');
dns.setServers([
  '0.0.0.0',
  '1.1.1.1',
])

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://https://ss-payment-portal.vercel.app'],
    credentials: true,
  })
);
// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://ss-payment-portal.onrender.com',
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/requests', require('./routes/requests'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/students', require('./routes/students'));
app.use('/api/payments', require('./routes/payments'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});