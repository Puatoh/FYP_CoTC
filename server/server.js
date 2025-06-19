// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const authRoutes           = require('./routes/authRoutes');      // your existing authRoutes
const bab1Routes           = require('./routes/bab1Routes');      // your existing bab1Routes
const forumT1Routes        = require('./routes/forumT1Routes');   // just created above
const forumT1CommentRoutes = require('./routes/forumT1CommentRoutes'); // just created above
const forumT1ReplyRoutes   = require('./routes/forumT1ReplyRoutes');
const moduleT1Routes       = require('./routes/moduleT1Routes');
const exerciseRoutes       = require('./routes/exerciseRoutes');
const attemptRoutes        = require('./routes/attemptRoutes');
const attemptAdminRoutes = require('./routes/attemptAdminRoutes');

app.use(cors());
app.use(bodyParser.json());

// Mount existing routes:
app.use('/api/auth', authRoutes);
app.use('/api/bab1', bab1Routes);

// Mount ForumT1 topic routes:
app.use('/api/forum-tingkatan-1', forumT1Routes);

// Mount ForumT1 comment routes under /api/forum-tingkatan-1/:topicId/comments
app.use('/api/forum-tingkatan-1/:topicId/comments', forumT1CommentRoutes);

app.use('/api/forum-tingkatan-1/:topicId/comments/:commentId/replies',forumT1ReplyRoutes);

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));

app.use('/api/modules', moduleT1Routes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/attempts', attemptAdminRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple ping & root routes
app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});
app.get('/api/ping', async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();
    res.send(result);
  } catch (err) {
    console.error('MongoDB ping failed:', err);
    res.status(500).send('Mongo connection failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
