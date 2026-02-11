const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

// GET /users - List all users
router.get("/", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

// POST /users - Create a new user profile
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }
    
    const userData = {
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection("users").add(userData);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      data: {
        id: docRef.id,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
});

// PUT /users/:id - Update a user profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: "At least one field (name or email) is required",
      });
    }
    
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    const updateData = {
      updatedAt: new Date().toISOString(),
    };
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    
    res.json({
      success: true,
      id: id,
      data: {
        id: id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
});

// DELETE /users/:id - Delete a user profile
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    await userRef.delete();
    
    res.json({
      success: true,
      id: id,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
});

// GET /users/:id - Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      id: id,
      data: {
        id: id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
});

module.exports = router;
