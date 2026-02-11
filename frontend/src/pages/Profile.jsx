import { useState, useEffect } from "react";
import "./Profile.css";

const API_URL = "http://localhost:5000/users";

function Profile() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch all users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        showMessage("error", "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showMessage("error", "Error connecting to server");
    }
    setLoading(false);
  };

  // Show message to user
  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", email: "" });
    setEditingId(null);
  };

  // Create a new user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showMessage("error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        showMessage("success", "User created successfully");
        resetForm();
        fetchUsers();
      } else {
        showMessage("error", data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showMessage("error", "Error connecting to server");
    }
    setLoading(false);
  };

  // Start editing a user
  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email });
    // Scroll to form
    document.getElementById("user-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Update an existing user
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name && !formData.email) {
      showMessage("error", "Please fill in at least one field");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        showMessage("success", "User updated successfully");
        resetForm();
        fetchUsers();
      } else {
        showMessage("error", data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("error", "Error connecting to server");
    }
    setLoading(false);
  };

  // Delete a user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        showMessage("success", "User deleted successfully");
        fetchUsers();
      } else {
        showMessage("error", data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showMessage("error", "Error connecting to server");
    }
    setLoading(false);
  };

  // Cancel editing
  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">User Profile Management</h1>

      {/* Message display */}
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Form for Create/Update */}
      <div id="user-form" className="profile-form-card">
        <h2 className="profile-form-title">
          {editingId ? "Edit User" : "Create New User"}
        </h2>
        <form onSubmit={editingId ? handleUpdate : handleCreate}>
          <div className="profile-form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user name"
              className="profile-input"
            />
          </div>
          <div className="profile-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter user email"
              className="profile-input"
            />
          </div>
          <div className="profile-form-actions">
            <button
              type="submit"
              className={`profile-btn ${editingId ? "btn-update" : "btn-create"}`}
              disabled={loading}
            >
              {loading ? "Processing..." : editingId ? "Update User" : "Create User"}
            </button>
            {editingId && (
              <button
                type="button"
                className="profile-btn btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users list */}
      <div className="profile-list-section">
        <h2 className="profile-list-title">All Users ({users.length})</h2>
        {loading && <div className="profile-loading">Loading...</div>}
        
        {!loading && users.length === 0 ? (
          <div className="profile-empty">No users found. Create one above!</div>
        ) : (
          <div className="profile-grid">
            {users.map((user) => (
              <div key={user.id} className="profile-user-card">
                <div className="profile-user-header">
                  <div className="profile-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="profile-user-info">
                    <h3 className="profile-user-name">{user.name}</h3>
                    <p className="profile-user-email">{user.email}</p>
                  </div>
                </div>
                <div className="profile-user-actions">
                  <button
                    className="profile-btn btn-edit"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="profile-btn btn-delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
