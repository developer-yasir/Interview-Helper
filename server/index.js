const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const questions = require('./data/questions');
const jobRoutes = require('./routes/jobs');
const uploadRoutes = require('./routes/upload');
const profileRoutes = require('./routes/profile');

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interview', require('./routes/interview'));
app.use('/api/auth', require('./routes/auth'));




app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/questions', (req, res) => {
    res.json(questions);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
