const express = require('express');
const cors = require('cors');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = 3001;

// Configure marked options for security and features
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  headerIds: true, // Add ids to headers
  mangle: false, // Don't escape HTML
  smartLists: true,
  smartypants: true,
});

// Configure sanitize-html options
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span'
  ],
  allowedAttributes: {
    'a': ['href', 'name', 'target'],
    'img': ['src', 'alt', 'title'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
};

// Middleware
app.use(cors());
app.use(express.json());

// Markdown processing endpoint
app.post('/api/markdown', (req, res) => {
  try {
    const { markdown } = req.body;
    
    if (!markdown || markdown == "undefined") {
      return res.status(400).json({ error: 'No markdown content provided' });
    }

    const rawHtml = marked(markdown);
    
    // Sanitize the HTML to prevent XSS
    const sanitizedHtml = sanitizeHtml(rawHtml, sanitizeOptions);
    
    res.json({ html: sanitizedHtml });
  } catch (error) {
    console.error('Error processing markdown:', error);
    res.status(500).json({ error: 'Failed to process markdown' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Markdown processing server running on port ${port}`);
});

