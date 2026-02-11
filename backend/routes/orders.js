const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// POST /checkout - Process checkout, reduce stock, create order
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { userId, shippingAddress, paymentMethod } = req.body;

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to checkout for this user',
      });
    }

    const cartDoc = await db.collection('carts').doc(userId).get();
    if (!cartDoc.exists || !cartDoc.data().items || cartDoc.data().items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    const cartData = cartDoc.data();
    const items = cartData.items;

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const bookDoc = await db.collection('books').doc(item.bookId).get();
      
      if (!bookDoc.exists) {
        return res.status(400).json({
          success: false,
          error: `Book ${item.bookId} not found`,
        });
      }

      const book = bookDoc.data();

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${book.title}". Available: ${book.stock}`,
        });
      }

      orderItems.push({
        bookId: item.bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: item.quantity,
      });

      subtotal += book.price * item.quantity;

      await db.collection('books').doc(item.bookId).update({
        stock: book.stock - item.quantity,
        updatedAt: new Date().toISOString(),
      });
    }

    const tax = subtotal * 0.08;
    const shippingCost = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shippingCost;

    const orderData = {
      userId,
      items: orderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'credit_card',
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    await db.collection('carts').doc(userId).delete();

    await db.collection('users').doc(userId).collection('userOrders').doc(orderRef.id).set({
      orderId: orderRef.id,
      total: orderData.total,
      status: orderData.status,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: orderRef.id,
        ...orderData,
      },
    });
  } catch (error) {
    console.error('Error processing checkout:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process checkout',
    });
  }
});

// GET /:userId - Fetch all orders for a user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these orders',
      });
    }

    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('userOrders')
      .orderBy('createdAt', 'desc')
      .get();

    const orderSummaries = [];
    snapshot.forEach((doc) => {
      orderSummaries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const orders = await Promise.all(
      orderSummaries.map(async (summary) => {
        const orderDoc = await db.collection('orders').doc(summary.orderId).get();
        return orderDoc.exists ? { id: orderDoc.id, ...orderDoc.data() } : null;
      })
    );

    res.json({
      success: true,
      data: orders.filter((order) => order !== null),
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// GET /admin/all - Get all orders (admin)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let query = db.collection('orders').orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.limit(parseInt(limit) || 100).get();
    
    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// PUT /admin/:id - Update order status (admin)
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const orderDoc = await db.collection('orders').doc(id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    await db.collection('orders').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: { orderId: id, status },
    });
  } catch (error) {
    console.error('Error updating order:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
    });
  }
});

module.exports = router;
