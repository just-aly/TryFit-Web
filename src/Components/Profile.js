import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import { auth, db } from "../firebase"; // adjust if your firebase file is in different path
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
  deleteUser,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

const MUNICIPALITIES = {
  Bamban: [
    "Anupul",
    "Banaba",
    "Bangcu",
    "Culubasa",
    "La Paz",
    "Lourdes",
    "San Nicolas",
    "San Pedro",
    "San Rafael",
    "San Vicente",
    "Santo Niño",
  ],
  Capas: [
    "Aranguren",
    "Cub-cub",
    "Dolores",
    "Estrada",
    "Lawy",
    "Manga",
    "Maruglu",
    "O’Donnell",
    "Santa Juliana",
    "Santa Lucia",
    "Santa Rita",
    "Santo Domingo",
    "Santo Rosario",
    "Talaga",
  ],
  "Tarlac City": [
    "Aguso",
    "Alvindia Segundo",
    "Amucao",
    "Armenia",
    "Asturias",
    "Atioc",
    "Balanti",
    "Balete",
    "Balibago I",
    "Balibago II",
    "Balingcanaway",
    "Banaba",
    "Bantog",
    "Baras-baras",
    "Batang-batang",
    "Binauganan",
    "Bora",
    "Buenavista",
    "Buhilit",
    "Burot",
    "Calingcuan",
    "Capehan",
    "Carangian",
    "Care",
    "Central",
    "Culipat",
    "Cut-cut I",
    "Cut-cut II",
    "Dalayap",
    "Dela Paz",
    "Dolores",
    "Laoang",
    "Ligtasan",
    "Lourdes",
    "Mabini",
    "Maligaya",
    "Maliwalo",
    "Mapalacsiao",
    "Mapalad",
    "Matatalaib",
    "Paraiso",
    "Poblacion",
    "Salapungan",
    "San Carlos",
    "San Francisco",
    "San Isidro",
    "San Jose",
    "San Jose de Urquico",
    "San Juan Bautista",
    "San Juan de Mata",
    "San Luis",
    "San Manuel",
    "San Miguel",
    "San Nicolas",
    "San Pablo",
    "San Pascual",
    "San Rafael",
    "San Roque",
    "San Sebastian",
    "San Vicente",
    "Santa Cruz",
    "Santa Maria",
    "Santo Cristo",
    "Santo Domingo",
    "Santo Niño",
    "Sapang Maragul",
    "Sapang Tagalog",
    "Sepung Calzada",
    "Sinait",
    "Suizo",
    "Tariji",
    "Tibag",
    "Tibagan",
    "Trinidad",
    "Ungot",
    "Villa Bacolor",
  ],
};

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState("");
  const [activeOption, setActiveOption] = useState("Edit Profile");

  // password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // loading / saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile fields (controlled)
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [userId, setUserId] = useState("");

  // Shipping fields (matching mobile model)
  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipHouse, setShipHouse] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [finalAddress, setFinalAddress] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [pickerStage, setPickerStage] = useState("municipality"); 
  const [isEditing, setIsEditing] = useState(false);
  const [hasShipping, setHasShipping] = useState(false);


  // Password fields used for Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Delete account input - only password (per your request)
  const [deletePasswordInput, setDeletePasswordInput] = useState("");

  const menuOptions = [
    "Edit Profile",
    "Shipping Location",
    "Change Password",
    "Delete Account",
  ];

  const headerMap = {
    "Edit Profile": "My Profile",
    "Shipping Location": "My Address",
    "Change Password": "My Password",
    "Delete Account": "Delete Account",
  };

   useEffect(() => {
      if (location.state?.openShippingLocations) {
        setActiveOption("Shipping Location");
      }
    }, [location.state]);

    
useEffect(() => {
  let mounted = true;

  async function loadUserData() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      setEmail(user.email || "");

      // Load user doc
      const uRef = doc(db, "users", user.uid);
      const uSnap = await getDoc(uRef);

      if (uSnap.exists() && mounted) {
        const data = uSnap.data();
        setName(data.name ?? data.fullName ?? "");
        setUsername(data.username ?? "");
        setPhone(data.phone ?? "");
        setGender(data.gender ?? "");
        setUserId(data.userId ?? user.uid); // save unique ID

        // Load shipping location by userId
        const q = query(
          collection(db, "shippingLocations"),
          where("userId", "==", data.userId ?? user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const s = querySnapshot.docs[0].data();
          setShipName(s.name ?? "");
          setShipPhone(s.phone ?? "");
          setShipHouse(s.house ?? "");
          setMunicipality(s.municipality ?? "");
          setBarangay(s.barangay ?? "");
          setFinalAddress(s.fullAddress ?? "");
          setShipPostal(s.postalCode ?? "");
          setHasShipping(true);

          // Set picker stage
          if (s.fullAddress) setPickerStage("final");
          else if (s.barangay) setPickerStage("final");
          else if (s.municipality) setPickerStage("barangay");
        } else {
          // fallback: use user doc info if no shipping doc exists
          setShipHouse(data.street ?? "");
          setFinalAddress(data.address ?? "");
          setShipPostal(data.postalCode ?? "");
          if (data.address) setPickerStage("final");
        }
      } else {
        // no user doc exists
        setName(user.displayName ?? "");
      }
    } catch (e) {
      console.error("Load user error", e);
      alert("Failed to load profile data.");
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadUserData();
  return () => (mounted = false);
}, [navigate]);



  // --- Edit Profile handlers ---
    async function handleSaveProfile() {
      const user = auth.currentUser;
      if (!user) {
        alert("Not logged in.");
        return;
      }

      // validation
      if (!username.trim() || !email.trim()) {
        alert("Please fill username and email.");
        return;
      }
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      setSaving(true);

      try {
        // Update displayName in Auth
        if (username !== (user.displayName ?? "")) {
          try {
            await user.updateProfile({ displayName: username });
          } catch (err) {
            console.warn("updateProfile error", err);
          }
        }

        // Update email in Auth
        if (email !== (user.email ?? "")) {
          try {
            await updateEmail(user, email);
          } catch (err) {
            if ((err?.code || "").includes("requires-recent-login")) {
              const pw = window.prompt("Enter your current password to change email:");
              if (!pw) {
                alert("Password required to change email.");
                setSaving(false);
                return;
              }
              try {
                const cred = EmailAuthProvider.credential(user.email || "", pw);
                await reauthenticateWithCredential(user, cred);
                await updateEmail(user, email);
              } catch (reauthErr) {
                alert(reauthErr?.message ?? "Failed to reauthenticate.");
                setSaving(false);
                return;
              }
            } else {
              alert(err?.message ?? "Failed to update email.");
              setSaving(false);
              return;
            }
          }
        }

        // Save to Firestore
        await setDoc(
          doc(db, "users", user.uid),
          {
            name: name.trim(),
            username: username.trim(),
            phone: phone.trim(),
            gender: gender || null,
            email: email.trim(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await user.reload();
        alert("Profile updated successfully.");
      } catch (e) {
        console.error("Save profile error", e);
        alert("Failed to save profile: " + (e?.message || e));
      } finally {
        setSaving(false);
      }
    }


  // --- Shipping logic: municipality -> barangay -> final (matches mobile) ---
  function handleMunicipalitySelect(mun) {
    if (!mun) {
      setMunicipality("");
      setBarangay("");
      setFinalAddress("");
      setPickerStage("municipality");
      return;
    }
    setMunicipality(mun);
    setBarangay("");
    setFinalAddress("");
    setPickerStage("barangay");
  }

  function handleBarangaySelect(brgy) {
    if (!brgy) {
      setBarangay("");
      setFinalAddress("");
      setPickerStage("barangay");
      return;
    }
    setBarangay(brgy);
    const full = `${brgy}, ${municipality}, Tarlac`;
    setFinalAddress(full);
    setPickerStage("final");
  }

const handleSaveShipping = async () => {
  // ✅ Clean input values
  const cleanedName = shipName.trim();
  const cleanedPhone = shipPhone.replace(/\s+/g, '');
  const cleanedHouse = shipHouse.trim();
  const cleanedPostal = shipPostal.trim();

  // ✅ Validation
  if (!cleanedName || !/^[A-Za-z\s.]+$/.test(cleanedName)) {
    return alert('Validation Error: Please enter a valid name (letters only).');
  }
  if (!cleanedPhone || !/^(09\d{9}|(\+639)\d{9})$/.test(cleanedPhone)) {
    return alert('Validation Error: Please enter a valid mobile number (e.g., 09xxxxxxxxx).');
  }
  if (!cleanedHouse || cleanedHouse.length < 5) {
    return alert('Validation Error: Please enter a more complete house/street/building information.');
  }
  if (!municipality) {
    return alert('Validation Error: Please select a municipality.');
  }
  if (!barangay) {
    return alert('Validation Error: Please select a barangay.');
  }
  if (!cleanedPostal || !/^\d{4}$/.test(cleanedPostal)) {
    return alert('Validation Error: Please enter a valid 4-digit postal code.');
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in.");
      return;
    }

    setSaving(true);

   // Get custom userId from users doc
    const uSnap = await getDoc(doc(db, "users", user.uid));
    const customUserId = uSnap.exists() ? uSnap.data().userId : user.uid;

    // Query using the custom ID
    const q = query(
      collection(db, "shippingLocations"),
      where("userId", "==", customUserId)
    );
    const querySnapshot = await getDocs(q);


    // ✅ Prepare data to save/update
    const saveData = {
      userId: customUserId,
      name: cleanedName,
      phone: cleanedPhone,
      house: cleanedHouse,
      municipality,
      barangay,
      fullAddress: finalAddress,
      postalCode: cleanedPostal,
      updatedAt: serverTimestamp(), // Always updated
    };

   if (querySnapshot.empty) {
    // New doc
    saveData.createdAt = new Date();
    saveData.shippingLocationID = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await addDoc(collection(db, "shippingLocations"), saveData);
    console.log("✅ New shipping location created!");
  } else {
    // Update existing
    const docRef = querySnapshot.docs[0].ref;
    const existingData = querySnapshot.docs[0].data();

    // Preserve createdAt & shippingLocationID
    saveData.createdAt = existingData.createdAt || new Date();
    saveData.shippingLocationID = existingData.shippingLocationID;

    await updateDoc(docRef, saveData);
    console.log("📦 Shipping location updated!");
  }

    setHasShipping(true);
    setIsEditing(false);
    setNotification("Shipping location saved successfully!");
    setTimeout(() => setNotification(""), 2000);

  } catch (err) {
    console.error("❌ Error saving shipping location:", err);
    alert("Failed to save shipping location.");
  } finally {
    setSaving(false);
  }
};



  // --- Change Password (reauth required) ---
  async function handleChangePassword() {
    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("New password should be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      alert("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      console.error("Change password error", e);
      const code = e?.code || "";
      if (code === "auth/wrong-password") {
        alert("Current password is incorrect.");
      } else if (code === "auth/weak-password") {
        alert("New password is weak. Choose a stronger password.");
      } else {
        alert("Failed to change password: " + (e?.message || e));
      }
    } finally {
      setSaving(false);
    }
  }

  // --- Delete Account (original UI: confirm password only + Cancel/Delete) ---
  async function handleDeleteAccount() {
    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in.");
      return;
    }
    if (!deletePasswordInput) {
      alert("Please enter your password to confirm deletion.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      // reauthenticate
      const cred = EmailAuthProvider.credential(user.email || "", deletePasswordInput);
      await reauthenticateWithCredential(user, cred);

      // delete shipping doc (ignore errors)
      try {
        await deleteDoc(doc(db, "users", user.uid, "shippingLocations", "default"));
      } catch (e) {
        console.warn("delete shipping doc", e);
      }

      // delete user doc
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (e) {
        console.warn("delete user doc", e);
      }

      // delete auth user
      await deleteUser(user);

      alert("Account deleted successfully.");
      navigate("/landing");
    } catch (e) {
      console.error("Delete account error", e);
      const code = e?.code || "";
      if (code === "auth/wrong-password") {
        alert("Password incorrect.");
      } else {
        alert("Failed to delete account: " + (e?.message || e));
      }
    } finally {
      setDeleting(false);
      setDeletePasswordInput("");
    }
  }

  // --- Helper UI for picker items ---
  function getPickerItems() {
    if (pickerStage === "municipality") {
      return ["", ...Object.keys(MUNICIPALITIES)];
    } else if (pickerStage === "barangay") {
      return ["", ...(MUNICIPALITIES[municipality] || [])];
    } else {
      return finalAddress ? [finalAddress] : [];
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <strong>Loading profile...</strong>
      </div>
    );
  }
  

  return (
    <div className="profile-page">
      <div className="profile-container">
        <aside className="sidebar">
          <h3 className="sidebar-title">My Account</h3>
          <ul className="sidebar-menu">
            {menuOptions.map((option) => (
              <li
                key={option}
                className={activeOption === option ? "active" : ""}
                onClick={() => setActiveOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </aside>

        <main className="profile-content">
          <div className="section-header">
            <h2>{headerMap[activeOption]}</h2>
          </div>

          <div
            className={`content-wrapper ${
              activeOption !== "Edit Profile" ? "single-column" : ""
            }`}
          >
            <div className="form-left">
              {/* EDIT PROFILE */}
              {activeOption === "Edit Profile" && (
                <>
                  <label>
                    Name
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                  </label>
                  <label>
                    User name
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                  </label>
                  <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </label>
                  <label>
                    Phone
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
                  </label>
                  <label className="gender-label">Gender</label>
                  <div className="gender-options">
                    <label>
                      <input type="radio" name="gender" value="Male" checked={gender === "Male"} onChange={() => setGender("Male")} /> Male
                    </label>
                    <label>
                      <input type="radio" name="gender" value="Female" checked={gender === "Female"} onChange={() => setGender("Female")} /> Female
                    </label>
                    <label>
                      <input type="radio" name="gender" value="Other" checked={gender === "Other"} onChange={() => setGender("Other")} /> Other
                    </label>
                  </div>
                  <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}

              {/* SHIPPING LOCATION */}
              {activeOption === "Shipping Location" && (
                <>
                  <label>
                    Name (Receiver)
                    <input
                      type="text"
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      placeholder="Enter name"
                      disabled={!isEditing && hasShipping}
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="text"
                      value={shipPhone}
                      onChange={(e) => setShipPhone(e.target.value)}
                      placeholder="e.g. 09123456789"
                      disabled={!isEditing && hasShipping}
                    />
                  </label>

                  <label>
                    House No., Street / Building
                    <input
                      type="text"
                      value={shipHouse}
                      onChange={(e) => setShipHouse(e.target.value)}
                      placeholder="e.g., 225, Purok Alpha"
                      disabled={!isEditing && hasShipping}
                    />
                  </label>

                  <label>
                    Address (pick municipality → barangay)
                    <div style={{ marginTop: 6 }}>
                      {/* Picker */}
                      {pickerStage === "municipality" && (
                        <select
                          value={municipality}
                          onChange={(e) => handleMunicipalitySelect(e.target.value)}
                          style={{ padding: 10, width: "100%", borderRadius: 6 }}
                          disabled={!isEditing && hasShipping}
                        >
                          <option value="">Select Municipality</option>
                          {Object.keys(MUNICIPALITIES).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      )}

                      {pickerStage === "barangay" && (
                        <select
                          value={barangay}
                          onChange={(e) => handleBarangaySelect(e.target.value)}
                          style={{ padding: 10, width: "100%", borderRadius: 6 }}
                          disabled={!isEditing && hasShipping}
                        >
                          <option value="">Select Barangay in {municipality}</option>
                          {(MUNICIPALITIES[municipality] || []).map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      )}

                      {pickerStage === "final" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="text"
                            value={finalAddress}
                            readOnly
                            style={{ padding: 10, flex: 1, borderRadius: 6 }}
                            disabled={!isEditing && hasShipping}
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setPickerStage("municipality");
                                setMunicipality("");
                                setBarangay("");
                                setFinalAddress("");
                              }}
                              style={{ padding: "10px 12px", borderRadius: 6 }}
                            >
                              Change
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </label>

                  <label>
                    Postal Code
                    <input
                      type="text"
                      value={shipPostal}
                      onChange={(e) => setShipPostal(e.target.value)}
                      placeholder="Enter postal code"
                      disabled={!isEditing && hasShipping}
                    />
                  </label>

                  <button
                    className="save-btn"
                    onClick={async () => {
                      if (hasShipping && !isEditing) {
                        setIsEditing(true);
                      } else {
                        await handleSaveShipping();
                        setIsEditing(false);
                        setHasShipping(true);
                        setNotification("Shipping address saved!");
                        setTimeout(() => setNotification(""), 1500);
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : hasShipping && !isEditing ? "Edit" : "Save"}
                  </button>

                </>
              )}

              {/* CHANGE PASSWORD */}
              {activeOption === "Change Password" && (
                <>
                  <label>
                    Current Password
                    <div className="password-wrapper">
                      <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                      <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </label>

                  <label>
                    New Password
                    <div className="password-wrapper">
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                      <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </label>

                  <label>
                    Confirm New Password
                    <div className="password-wrapper">
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" />
                      <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </label>

                  <button className="save-btn" onClick={handleChangePassword} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}

              {/* DELETE ACCOUNT - original UI with only confirm password and buttons */}
              {activeOption === "Delete Account" && (
                <>
                  <p style={{ color: "#B22222", fontWeight: 600 }}>
                    Warning: Deleting your account is permanent and cannot be undone. This will remove all your data (orders, preferences, profile).
                  </p>

                  <label>
                    Confirm Password
                    <div className="password-wrapper">
                      <input type={showDeletePassword ? "text" : "password"} value={deletePasswordInput} onChange={(e) => setDeletePasswordInput(e.target.value)} placeholder="Enter your password" />
                      <span className="eye-icon" onClick={() => setShowDeletePassword(!showDeletePassword)}>{showDeletePassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </label>

                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button className="save-btn" onClick={() => { setDeletePasswordInput(""); }} style={{ background: "#999" }}>
                      Cancel
                    </button>
                    <button className="save-btn" onClick={handleDeleteAccount} disabled={deleting} style={{ background: "#d9534f" }}>
                      {deleting ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT side (profile picture) */}
            {activeOption === "Edit Profile" && (
              <div className="form-right">
                <div className="profile-pic-wrapper">
                  <img src="https://via.placeholder.com/150" alt="Profile" className="profile-pic" />
                  <button className="edit-btn">✎</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .profile-page {
          flex-direction: column;
          padding-top: 160px; 
          padding-bottom: 60px; 
          display: flex;
          justify-content: center;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
          margin: 0 auto;
          overflow-x: hidden;
        }

        .profile-container {
          display: flex;
          background: #fff;
          border: 2px solid #6a5acd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          box-sizing: border-box;
          flex-wrap: nowrap;
        }

        /* Sidebar */
        .sidebar {
          flex: 0 0 270px; 
          background: #f3f0ff;
          padding: 20px;
          box-sizing: border-box;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          color: #222;
          padding-bottom: 10px;
          border-bottom: 1px solid #ccc;
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-menu li {
          position: relative;
          padding: 14px 15px;
          cursor: pointer;
          color: #555;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .sidebar-menu li:hover {
          background: #e5dcff;
          color: #000;
          width: 95%;
        }

        .sidebar-menu li.active {
          font-weight: bold;
          color: #000;
          background: #fff;
          border-left: 4px solid #d220ff;
          width: 94%;
        }

        /* Main content */
        .profile-content {
          flex: 1;            
          min-width: 0;       
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .section-header {
          width: 90%;
          padding: 20px 40px 15px;
          border-bottom: 1px solid #ccc;
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }

        .section-header h2 {
          font-size: 1.4rem;
          margin: 0;
          margin-top: 20px;
          color: #222;
        }

        .content-wrapper {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          padding: 40px;
          box-sizing: border-box;
          min-height: 500px;
        }

        .content-wrapper.single-column {
          justify-content: flex-start;
          align-items: flex-start;
        }

        .form-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
        }

        label {
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #333;
        }

        .profile-page input[type="text"],
        .profile-page input[type="email"],
        .profile-page input[type="password"],
        .profile-page select {
          padding: 10px;
          border: 1.5px solid #999;
          border-radius: 6px;
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        input:focus, select:focus {
          border-color: #6a5acd;
        }

        .gender-options {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
        }

        .save-btn {
          margin-top: 10px;
          padding: 12px;
          background: #6a5acd;
          color: #fff;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 160px;
          transition: 0.2s;
        }

        .save-btn:hover {
          background: #5746c6;
        }

        .form-right {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          padding-top: 5px; 
          padding-left: 50px;
        }

        .profile-pic-wrapper {
          position: relative;
          display: inline-block;
        }

        .profile-pic {
          width: 160px;
          height: 160px; 
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #6a5acd;
          display: block; 
        }

        .edit-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #6a5acd;
          color: white;
          border: none;
          border-radius: 50%;
          padding: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        /* Password eye toggle */
        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .password-wrapper input {
          width: 100%;
          padding-right: 35px;
          box-sizing: border-box;
        }

        .eye-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
        }

      `}</style>
    </div>
  );
}
