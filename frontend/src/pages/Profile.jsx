import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut, deleteUser, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ id: userDoc.id, ...userData });
          setProfileData({
            displayName: userData.displayName || "",
            email: userData.email || firebaseUser.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        } else {
          // Create basic user data
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          });
          setProfileData({
            displayName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: "",
            address: "",
          });
        }
      } else {
        // Not logged in, redirect to login
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!auth.currentUser) {
      setError("Please log in to update your profile");
      return;
    }

    setSaving(true);

    try {
      // Update Firebase Auth display name
      if (profileData.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
        });
      }

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        updatedAt: new Date().toISOString(),
      });

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.username = profileData.displayName;
      localStorage.setItem("user", JSON.stringify(storedUser));

      setUser((prev) => ({
        ...prev,
        displayName: profileData.displayName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      }));

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError("");

    try {
      // Delete user document from Firestore
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await deleteDoc(userRef);
      }

      // Delete user from Firebase Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");

      // Sign out and redirect
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.code === "auth/requires-recent-login") {
        setError("Please sign in again before deleting your account.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      {/* Messages */}
      {error && <div className="profile-message profile-message-error">{error}</div>}
      {success && <div className="profile-message profile-message-success">{success}</div>}

      {/* Profile Card */}
      <div className="profile-card">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            <span className="profile-avatar-initial">
              {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <p className="profile-user-id">User ID: {user?.uid?.slice(0, 8)}...</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="displayName" className="profile-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
              </svg>
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="profile-input"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="email" className="profile-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
              </svg>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="profile-input"
              disabled
            />
            <small className="profile-help-text">Email cannot be changed</small>
          </div>

          <div className="profile-form-group">
            <label htmlFor="phone" className="profile-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/>
              </svg>
              Contact Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              placeholder="Enter your contact number"
              className="profile-input"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="address" className="profile-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              className="profile-input profile-textarea"
              rows="3"
            />
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="profile-btn btn-save" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="profile-danger-zone">
        <h3 className="profile-danger-title">Danger Zone</h3>
        <p className="profile-danger-text">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            className="profile-btn btn-delete-account"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="profile-delete-confirm">
            <p className="profile-delete-warning">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="profile-delete-actions">
              <button 
                className="profile-btn btn-delete-confirm"
                onClick={handleDeleteAccount}
              >
                Yes, Delete My Account
              </button>
              <button 
                className="profile-btn btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="profile-logout-section">
        <button className="profile-btn btn-logout" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;
