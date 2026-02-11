const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// GET / - Fetch all books with optional search filter
router.get('/', async (req, res) => {
  try {
    const { search, category, author, limit } = req.query;
    
    let query = db.collection('books');
    
    // If no search query, order by createdAt descending
    if (!search) {
      query = query.orderBy('createdAt', 'desc');
    }
    
    if (category) {
      query = query.where('category', '==', category);
    }
    if (author) {
      query = query.where('author', '==', author);
    }
    
    const snapshot = await query.limit(parseInt(limit) || 100).get();
    
    let books = [];
    snapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Apply case-insensitive search filter on title and author
    if (search) {
      const searchLower = search.toLowerCase();
      books = books.filter(book => 
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books',
    });
  }
});

// GET /:id - Fetch single book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookDoc = await db.collection('books').doc(id).get();

    if (!bookDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: bookDoc.id,
        ...bookDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book',
    });
  }
});

// POST / - Add new book (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, author, description, price, category, imageUrl, stock, isbn, publisher, publishedDate, pages } = req.body;

    if (!title || !author || !price) {
      return res.status(400).json({
        success: false,
        error: 'Title, author, and price are required',
      });
    }

    const bookData = {
      title,
      author,
      description: description || '',
      price: parseFloat(price),
      category: category || 'General',
      imageUrl: imageUrl || '',
      stock: parseInt(stock) || 0,
      isbn: isbn || '',
      publisher: publisher || '',
      publishedDate: publishedDate || '',
      pages: parseInt(pages) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('books').add(bookData);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: {
        id: docRef.id,
        ...bookData,
      },
    });
  } catch (error) {
    console.error('Error creating book:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create book',
    });
  }
});

// PUT /:id - Update book (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, price, category, imageUrl, stock, isbn, publisher, publishedDate, pages } = req.body;

    const bookDoc = await db.collection('books').doc(id).get();
    if (!bookDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isbn !== undefined) updateData.isbn = isbn;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (publishedDate !== undefined) updateData.publishedDate = publishedDate;
    if (pages !== undefined) updateData.pages = parseInt(pages);

    await db.collection('books').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update book',
    });
  }
});

// DELETE /:id - Delete book (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const bookDoc = await db.collection('books').doc(id).get();
    if (!bookDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    await db.collection('books').doc(id).delete();

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete book',
    });
  }
});

module.exports = router;
