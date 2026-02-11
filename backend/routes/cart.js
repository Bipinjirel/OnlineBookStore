const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

// POST / - Add items to cart
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    const { bookId, quantity } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'userId and bookId are required',
      });
    }

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this cart',
      });
    }

    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();

    let cartData = cartDoc.exists ? cartDoc.data() : { items: [], updatedAt: new Date().toISOString() };

    const existingItemIndex = cartData.items.findIndex((item) => item.bookId === bookId);

    if (existingItemIndex >= 0) {
      cartData.items[existingItemIndex].quantity += parseInt(quantity) || 1;
    } else {
      cartData.items.push({
        bookId,
        quantity: parseInt(quantity) || 1,
        addedAt: new Date().toISOString(),
      });
    }

    cartData.updatedAt = new Date().toISOString();
    await cartRef.set(cartData, { merge: true });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cartData,
    });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
    });
  }
});

// GET /:userId - Fetch cart items for a user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this cart',
      });
    }

    const cartDoc = await db.collection('carts').doc(userId).get();

    if (!cartDoc.exists) {
      return res.json({
        success: true,
        data: { items: [] },
      });
    }

    const cartData = cartDoc.data();

    if (cartData.items && cartData.items.length > 0) {
      const booksWithDetails = await Promise.all(
        cartData.items.map(async (item) => {
          const bookDoc = await db.collection('books').doc(item.bookId).get();
          if (bookDoc.exists) {
            return {
              ...item,
              book: { id: bookDoc.id, ...bookDoc.data() },
            };
          }
          return { ...item, book: null };
        })
      );

      cartData.items = booksWithDetails.filter((item) => item.book !== null);

      cartData.total = cartData.items.reduce((sum, item) => {
        return sum + (item.book.price * item.quantity);
      }, 0);
    }

    res.json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
    });
  }
});

// PUT /:userId - Update cart items
router.put('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this cart',
      });
    }

    const cartData = {
      items,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('carts').doc(userId).set(cartData, { merge: true });

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cartData,
    });
  } catch (error) {
    console.error('Error updating cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart',
    });
  }
});

// DELETE /:userId - Clear cart
router.delete('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to clear this cart',
      });
    }

    await db.collection('carts').doc(userId).delete();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
    });
  }
});

module.exports = router;
