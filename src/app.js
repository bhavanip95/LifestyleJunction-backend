// app.js
const express = require('express');
const mongoose = require('mongoose');
const articlesRoutes = require('./routes/articles');

const app = express();



// Connect to MongoDB (replace <connection_string> with your actual string)
mongoose.connect('mongodb+srv://bhavanipatil3:<db_password>@learnmongo.cutsv.mongodb.net/?retryWrites=true&w=majority&appName=learnMongo', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Middleware to parse JSON requests
app.use(express.json());

// Use the articles routes
app.use(articlesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
