const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    // Basic article info
    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    // Categorization fields
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
        validate: [array => array.length > 0, 'At least one tag is required']
      },

    // Optional featured image and thumbnail for list views
    thumbnail: {
        type: String // URL for a thumbnail image (optional)
    },
    excerpt: {
        type: String,

    },

    // Array of images for richer visual content within the article
    images: [
        {
            url: { type: String, required: true },
            altText: { type: String },   // For accessibility and SEO
            caption: { type: String }    // Optional caption for each image
        }
    ],

    // Optional external or related links that can be showcased within the article
    links: [
        {
            label: { type: String },     // Text to display for the link
            url: { type: String }        // The actual URL
        }
    ],

    // Optional video content that can be embedded within the article
    videoUrl: {
        type: String  // URL for an embedded video (e.g., YouTube/Vimeo)
    },

    // Tags to further categorize the article and improve searchability
 

    // Author information to attribute the article
    author: {
        name: { type: String },
        profileImage: { type: String } // URL for author's image
    },

    // SEO related metadata
    meta: {
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: { type: String }
    },

    // Publication info for scheduling or displaying the publication date
    publishedAt: {
        type: Date
    },

    // Timestamps to track creation and updates
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Optional index to improve filtering performance on category fields
ArticleSchema.index({ category: 1, subCategory: 1 });

module.exports = mongoose.model('Article', ArticleSchema);
