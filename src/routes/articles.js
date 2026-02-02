const express = require('express');
const router = express.Router();
const Article = require('../models/article');

// ========== GET ALL ARTICLES ==========
// GET /api/articles?category=Beauty&difficulty=Easy&limit=10&page=1
router.get('/articles', async (req, res) => {
  try {
    const { 
      category, 
      subCategory, 
      tags, 
      difficulty, 
      status = 'published',
      limit = 10, 
      page = 1,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build filter
    let filter = { status };
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    
    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };
    
    // Execute query with pagination
    const articles = await Article.find(filter)
      .select('title slug excerpt category subCategory tags difficulty featuredImage views likes createdAt author')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sortObj);
    
    // Get total count for pagination
    const total = await Article.countDocuments(filter);
    
    res.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching articles',
      error: error.message 
    });
  }
});

// ========== GET SINGLE ARTICLE BY SLUG ==========
// GET /api/articles/:slug
router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug,
      status: 'published'
    });
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }
    
    // Increment views
    article.views += 1;
    await article.save();
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching article',
      error: error.message 
    });
  }
});

// ========== SEARCH ARTICLES ==========
// GET /api/articles/search?q=hair
router.get('/articles/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }
    
    const articles = await Article.find(
      { 
        $text: { $search: q },
        status: 'published'
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .select('title slug excerpt category featuredImage');
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching articles',
      error: error.message 
    });
  }
});

// ========== CREATE ARTICLE ==========
// POST /api/articles
router.post('/articles', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    // Handle duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Article with this slug already exists'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error creating article',
      error: error.message 
    });
  }
});

// ========== UPDATE ARTICLE ==========
// PUT /api/articles/:id
router.put('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validation
      }
    );
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating article',
      error: error.message 
    });
  }
});

// ========== DELETE ARTICLE ==========
// DELETE /api/articles/:id
router.delete('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting article',
      error: error.message 
    });
  }
});

// ========== LIKE ARTICLE ==========
// POST /api/articles/:id/like
router.post('/articles/:id/like', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }
    
    article.likes += 1;
    await article.save();
    
    res.json({
      success: true,
      likes: article.likes
    });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error liking article',
      error: error.message 
    });
  }
});

// ========== GET FEATURED ARTICLES ==========
// GET /api/articles/featured
router.get('/featured', async (req, res) => {
  try {
    const articles = await Article.find({ 
      status: 'published',
      featured: true 
    })
    .limit(6)
    .select('title slug excerpt category featuredImage')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured articles',
      error: error.message 
    });
  }
});

module.exports = router;