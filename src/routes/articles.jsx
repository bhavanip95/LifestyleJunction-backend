// routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// GET /api/articles?category=<category>&subCategory=<subCategory>
router.get('/api/articles', async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    // Select only summary fields for listing
    const articles = await Article.find(filter).select('title category subCategory thumbnail');
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
