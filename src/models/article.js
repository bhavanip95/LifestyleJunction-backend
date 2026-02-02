const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  // ========== BASIC INFO ==========
  title: { 
    type: String, 
    required: true, 
    maxLength: 100,
    trim: true 
  },
  slug: { 
     type: String, 
  unique: true,
  sparse: true
  },
  excerpt: { 
    type: String, 
    required: true, 
    maxLength: 250 
  },
  
  // ========== CATEGORIZATION ==========
  category: { 
    type: String, 
    required: true,
    enum: [
      'Beauty & Self-Care',
      'Food & Nutrition',
      'Family & Lifestyle',
      'Arts, Crafts & Fashion',
      'Finance & Career',
      'Health & Wellness',
      'Travel & Leisure',
      'Community'
    ]
  },
  subCategory: { 
    type: String, 
    required: true 
  },
  tags: {
    type: [String],
    validate: [array => array.length >= 3 && array.length <= 5, 
               'Must have 3-5 tags']
  },
  
  // ========== DIFFICULTY & TIME ==========
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  prepTime: { 
    type: Number, 
    min: 0 
  }, // in minutes
  totalTime: { 
    type: Number, 
    min: 0 
  }, // in minutes
  
  // ========== COST & MATERIALS ==========
  costRange: { 
    type: String,
    enum: [
      'Under ₹50',
      'Under ₹100',
      'Under ₹200',
      'Under ₹500',
      'Under ₹1000',
      '₹1000+'
    ]
  },
  ingredientsCount: { 
    type: Number,
    min: 0
  },
  availability: { 
    type: String,
    enum: ['Easy to find', 'Medium', 'Hard to find'],
    default: 'Easy to find'
  },
  
  // ========== CONTENT ==========
  content: {
    purpose: { 
      type: String, 
      required: true 
    },
    
    ingredients: [{
      name: { type: String, required: true },
      quantity: { type: String, required: true },
      optional: { type: Boolean, default: false },
      substitute: { type: String },
      whereToBuy: { type: String },
      cost: { type: String }
    }],
    
    steps: [{
      stepNumber: { type: Number, required: true },
      instruction: { type: String, required: true },
      tip: { type: String },
      timeRequired: { type: String },
      image: { type: String } // URL to step image
    }],
    
    tips: [{ type: String }],
    warnings: [{ type: String }],
    results: { type: String }
  },
  
  // ========== MEDIA ==========
  featuredImage: { 
    type: String,
    required: true 
  }, // Cloudinary URL
  images: [{ type: String }], // Additional images
  videoUrl: { type: String }, // YouTube/Vimeo URL
  
  // ========== ENGAGEMENT ==========
  views: { 
    type: Number, 
    default: 0,
    min: 0
  },
  likes: { 
    type: Number, 
    default: 0,
    min: 0
  },
  saves: { 
    type: Number, 
    default: 0,
    min: 0
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  savedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // ========== COMMENTS ==========
  comments: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    userName: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // ========== AUTHOR ==========
  author: {
    id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: { type: String, required: true },
    verified: { type: Boolean, default: false },
    bio: { type: String }
  },
  
  // ========== STATUS ==========
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  seasonal: { 
    type: Boolean, 
    default: false 
  },
  season: { 
    type: String 
  },
  
  // ========== SEO ==========
  metaTitle: { 
    type: String,
    maxLength: 60
  },
  metaDescription: { 
    type: String,
    maxLength: 160
  },
  keywords: [{ type: String }],
  
  // ========== CATEGORY-SPECIFIC FIELDS ==========
  // Beauty fields
  beautyFields: {
    skinType: [String],
    hairType: [String],
    concern: [String],
    suitableFor: [String],
    allergies: [String],
    shelfLife: String,
    frequency: String
  },
  
  // Food fields
  foodFields: {
    cuisine: String,
    mealType: String,
    dietType: [String],
    servings: Number,
    calories: Number,
    nutrition: {
      protein: String,
      carbs: String,
      fat: String,
      fiber: String
    },
    spiceLevel: String,
    cookingMethod: [String],
    occasion: [String]
  }
  
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// ========== INDEXES ==========
ArticleSchema.index({ title: 'text', excerpt: 'text', tags: 'text' }); // Text search
ArticleSchema.index({ category: 1, status: 1 }); // Filter by category

ArticleSchema.index({ status: 1, featured: 1 }); // Homepage featured articles
ArticleSchema.index({ views: -1 }); // Popular articles

// ========== METHODS ==========
// Auto-generate slug from title


// Auto-generate slug from title
ArticleSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (this.isNew) {
      const timestamp = Date.now().toString().slice(-4);
      this.slug = `${this.slug}-${timestamp}`;
    }
  }
  next();
});


module.exports = mongoose.model('Article', ArticleSchema);