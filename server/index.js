const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const analyzeRoute = require('./routes/analyze');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const studentRoutes = require('./routes/student');
const processRoutes = require('./routes/process');

app.use('/api', analyzeRoute);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/student', studentRoutes);
app.use('/process', processRoutes);

app.get('/', (req, res) => {
    res.send('Server is running. POST to /api/analyze for skill gap analysis.');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillforge')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
