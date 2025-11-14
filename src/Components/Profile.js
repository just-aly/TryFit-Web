import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import { auth, db } from "../firebase"; 
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
  getFirestore,
} from "firebase/firestore";

import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
  deleteUser,
  signOut,
} from "firebase/auth";
// import { v4 as uuidv4 } from "uuid";

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
 // const [confirmingDelete, setConfirmingDelete] = useState(false); 

  // ✅ Popup system
const [popup, setPopup] = useState({ show: false, message: "", type: "" });
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

const showPopup = (msg, type = "success") => {
  setPopup({ show: true, message: msg, type });
  setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
};


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



  async function handleSaveProfile() {
    const user = auth.currentUser;
    if (!user) {
      showPopup("Not logged in.");
      return;
    }

    // validation
    if (!username.trim() || !email.trim()) {
      showPopup("Please fill username and email.", "warning");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      showPopup("Please enter a valid email address.", "warning");
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
              showPopup("Password required to change email.", "warning");
              setSaving(false);
              return;
            }
            try {
              const cred = EmailAuthProvider.credential(user.email || "", pw);
              await reauthenticateWithCredential(user, cred);
              await updateEmail(user, email);
            } catch (reauthErr) {
              showPopup(reauthErr?.message ?? "Failed to reauthenticate.");
              setSaving(false);
              return;
            }
          } else {
            showPopup(err?.message ?? "Failed to update email.", "error");
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
      showPopup("Profile updated successfully.", "success");
    } catch (e) {
      console.error("Save profile error", e);
      showPopup("Failed to save profile: " + (e?.message || e));
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

 async function handleChangePassword() {
  const user = auth.currentUser;
  if (!user) {
    showPopup("Not logged in.", "error");
    return;
  }

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showPopup("Please fill all password fields.", "warning");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showPopup("New password and confirm password do not match.", "warning");
    return;
  }

  if (newPassword.length < 6) {
    showPopup("New password should be at least 6 characters.", "warning");
    return;
  }

  // 🔥 Ask for confirmation
  const confirmed = window.confirm("Are you sure you want to change your password?");
  if (!confirmed) return; // user cancelled

  setSaving(true);

  try {
    const cred = EmailAuthProvider.credential(user.email || "", currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);

    showPopup("Password changed successfully.", "success");

    // Logout after password change
    await signOut(auth);

    // Prevent navigating back
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    navigate("/login", { replace: true });
  } catch (e) {
    console.error("Change password error", e);
    const code = e?.code || "";
    if (code === "auth/wrong-password") {
      showPopup("Current password is incorrect.", "error");
    } else if (code === "auth/weak-password") {
      showPopup("New password is weak. Choose a stronger password.", "error");
    } else {
      showPopup("Failed to change password: " + (e?.message || e), "error");
    }
  } finally {
    setSaving(false);
  }
}


 
async function handleDeleteAccount() {
  const user = auth.currentUser;
  if (!user) {
    showPopup("Not logged in.", "error");
    return;
  }

  if (!deletePasswordInput.trim()) {
    showPopup("Please enter your password to confirm deletion.", "warning");
    return;
  }

  setDeleting(true);
  try {
    // ✅ Reauthenticate user first
    const cred = EmailAuthProvider.credential(user.email || "", deletePasswordInput);
    await reauthenticateWithCredential(user, cred);

    // ✅ Show confirmation modal
    setShowDeleteConfirm(true);
  } catch (e) {
    console.error("Delete account error", e);
    if (e.code === "auth/wrong-password") {
      showPopup("Incorrect password.", "error");
    } else {
      showPopup("Failed to verify password. Try again.", "error");
    }
  } finally {
    setDeleting(false);
  }
}

  async function confirmDeleteAccount() {
    const user = auth.currentUser;
    if (!user) return;

    setDeleting(true);
    try {
      const db = getFirestore();

      // Get user's document
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) throw new Error("User document not found.");
      const userData = userDocSnap.data();
      const userUniqueId = userData.userId || user.uid;

      // 1️⃣ Delete user profile
      await deleteDoc(userDocRef);

      // 2️⃣ Collections to anonymize
      const collectionsToAnonymize = ["chatMessages", "productReviews"];
      for (const collectionName of collectionsToAnonymize) {
        const q = query(collection(db, collectionName), where("userId", "==", userUniqueId));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
          await updateDoc(docSnap.ref, {
            userId: null,
            username: "User not found",
          });
        }
      }

      // 3️⃣ Collections to delete completely
      const collectionsToDelete = ["cartItems", "measurements", "notifications", "shippingLocations"];
      for (const collectionName of collectionsToDelete) {
        const q = query(collection(db, collectionName), where("userId", "==", userUniqueId));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
      }

      // 4️⃣ Orders: delete pending, anonymize others
      const ordersRef = collection(db, "orders");
      const ordersQuery = query(ordersRef, where("userId", "==", userUniqueId));
      const ordersSnapshot = await getDocs(ordersQuery);
      for (const docSnap of ordersSnapshot.docs) {
        const data = docSnap.data();
        if (data.status === "pending") {
          await deleteDoc(docSnap.ref);
        } else {
          await updateDoc(docSnap.ref, {
            name: "User not found",
            address: null,
            userId: null,
          });
        }
      }

      // 5️⃣ Update toReceive and toShip
      const toUpdateCollections = ["toReceive", "toShip"];
      for (const collectionName of toUpdateCollections) {
        const q = query(collection(db, collectionName), where("userId", "==", userUniqueId));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
          await updateDoc(docSnap.ref, {
            name: "User not found",
            address: null,
            userId: null,
          });
        }
      }

      // 6️⃣ Delete user from Auth
      await deleteUser(user);

      showPopup("Account successfully deleted.", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("confirmDeleteAccount error", error);
      showPopup("Failed to delete account: " + error.message, "error");
    } finally {
      setDeleting(false);
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
                    <input type="text" maxLength={50} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
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
                    <input
                      type="text"
                      value={phone} // <-- use profile phone state
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // digits only
                        if (value.length <= 11) setPhone(value); // save to profile state
                      }}
                      placeholder="Enter your phone number"
                    />
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
                      maxLength={50}
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      placeholder="Enter name"
                      disabled={!isEditing && hasShipping}
                    />
                  </label>

                <label>
                  Phone
                  <input
                    type="text"
                    value={shipPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // remove non-numeric
                      if (value.length <= 11) setShipPhone(value);
                    }}
                    placeholder="Enter your phone number"
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // allow digits only
                      if (value.length <= 4) setShipPostal(value); // limit to 4 digits
                    }}
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

            {/* DELETE ACCOUNT */}
            {activeOption === "Delete Account" && (
              <>
                <p style={{ color: "#B22222", fontWeight: 600 }}>
                  Warning: Deleting your account is permanent and cannot be undone. This will remove all your data (orders, preferences, profile).
                </p>

                <label>
                  Confirm Password
                  <div className="password-wrapper">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePasswordInput}
                      onChange={(e) => setDeletePasswordInput(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <span
                      className="eye-icon"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                    >
                      {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </label>

                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <button
                    className="save-btn"
                    onClick={() => {
                      setDeletePasswordInput("");
                    }}
                    style={{ background: "#999" }}
                  >
                    Cancel
                  </button>
               <button
                className="save-btn"
                onClick={handleDeleteAccount}
                style={{ background: "#d9534f" }}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
                </div>
              </>
            )}

            {/* ✅ CONFIRM DELETE MODAL */}
            {showDeleteConfirm && (
            <div className="popup warning" style={{ top: "20px", left: "50%", transform: "translateX(-50%)" }}>
              <p>⚠️ Are you sure you want to permanently delete your account?</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: "#d9534f",
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    confirmDeleteAccount();
                  }}
                  disabled={deleting}
                  style={{
                    color: "white",
                    background: "#0cad00ff",
                    color: "#ffffffff",
                    padding: "5px 12px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}

            {/* ✅ GLOBAL POPUP */}
            {popup.show && (
              <div className={`popup ${popup.type}`}>
                <div className="popup-icon">
                  {popup.type === "success" && "✅"}
                  {popup.type === "warning" && "⚠️"}
                  {popup.type === "error" && "❌"}
                </div>
                <div className="popup-text">
                  <strong className="popup-title">
                    {popup.type === "success"
                      ? "Success!"
                      : popup.type === "warning"
                      ? "Warning!"
                      : "Error!"}
                  </strong>
                  <p className="popup-message">{popup.message}</p>
                </div>
                <button
                  className="popup-close"
                  onClick={() => setPopup({ show: false, message: "", type: "" })}
                >
                  ×
                </button>
              </div>
            )}
          </div>
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
        .profile-page input[type="number"],
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
        
            /* ✅ TryFit Enhanced Popup Styles */
      /* ✅ Popup Styles (Blue - Yellow - Red) */
      /* ✅ Popup Styles (Green - Yellow - Red) */
      .popup {
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        font-family: 'Poppins', sans-serif;
        color: #333;
        padding: 14px 20px;
        animation: fadeIn 0.4s ease, fadeOut 0.5s ease 1.8s forwards;
        z-index: 9999;
        min-width: 300px;
        border-left: 6px solid #4CAF50; /* default (success) border */
      }

      /* Icon inside popup */
      .popup-icon {
        font-size: 1.6rem;
      }

      /* Text section */
      .popup-text {
        flex: 1;
      }

      .popup-title {
        display: block;
        font-weight: 700;
        font-size: 1rem;
        margin-bottom: 2px;
      }

      .popup-message {
        font-size: 0.9rem;
        margin: 0;
      }

      /* Close button */
      .popup-close {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #333;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ✅ Color Variants */
      .popup.success {
        background: #e9f8ec;
        border-left: 6px solid #4CAF50; /* Green */
        color: #256d32;
      }

      .popup.warning {
        background: #fff8e1;
        border-left: 6px solid #f5b800; /* Yellow */
        color: #b07e00;
      }

      .popup.error {
        background: #fdecea;
        border-left: 6px solid #f44336; /* Red */
        color: #a30000;
      }

      /* Animation */
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }

      @keyframes fadeOut {
        to { opacity: 0; transform: translate(-50%, -20px); }
      }

      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
      }

      .modal-content {
        background: #fff;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        width: 400px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }

      .modal-buttons {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        gap: 20px;
      }

      .cancel-btn,
      .delete-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      .cancel-btn {
        background: #ccc;
        color: #333;
      }

      .delete-btn {
        background: #d9534f;
        color: #fff;
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

    @media (max-width: 480px) {
  .profile-page {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding-top: 100px !important;
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-x: hidden;
  }

  .profile-container {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    border: none;
    box-shadow: none;
  }

  /* ✅ Sidebar stays fixed width but not full height */
  .sidebar {
    flex: 0 0 110px !important;
    background: #f8f6ff;
    border-right: 1px solid #ddd;
    padding: 6px;
    align-self: flex-start;
    height: auto;
  }

  .sidebar h3 {
    font-size: 0.8rem;
    margin-bottom: 6px;
  }

  .sidebar li {
    font-size: 0.7rem;
    padding: 4px 6px;
    border-radius: 4px;
    margin-bottom: 3px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .sidebar-menu li.active {
    font-weight: bold;
    color: #000;
    background: #fff;
    border-left: 4px solid #d220ff;
    width: 92%;
  }

  /* ✅ Prevent profile-content from resizing or moving header */
  .profile-content {
    flex: 1;
    background: #fff;
    overflow-y: auto;
    min-height: 100%; /* Keeps stable height */
    display: flex;
    flex-direction: column;
  }

  /* ✅ Header stays in place — content switches below it */
  .section-header {
    margin-bottom: 8px;
    flex-shrink: 0; /* Prevent from collapsing */
  }

  .section-header h2 {
    font-size: 0.9rem;
    margin: 0;
  }

  .profile-section {
    flex-grow: 1;
    margin-bottom: 10px;
    padding: 6px;
  }

  /* ✅ Make labels smaller */
  .profile-section label {
    font-size: 0.6rem;
    display: block;
    margin-bottom: 3px;
  }

  /* ✅ Inputs and placeholders */
  input,
  select {
    font-size: 0.6rem;
    padding: 4px 6px;
    height: 26px;
    border-radius: 4px;
  }

  /* ✅ Make placeholder text smaller */
  input::placeholder,
  select::placeholder,
  textarea::placeholder {
    font-size: 0.8rem;
    color: #999;
  }

  input[type="radio"] {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    vertical-align: middle;
  }

  .radio-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .radio-label {
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .save-btn {
    width: 100%;
    font-size: 0.8rem;
    padding: 6px;
    height: 32px;
  }

  .eye-icon {
    font-size: 0.8rem;
  }

  .profile-footer {
    margin-top: 8px;
    text-align: center;
    font-size: 0.75rem;
  }

  p, span, h4, h5 {
    font-size: 0.75rem;
  }
}

/* ✅ Eye icon styling (outside media query, for all screens) */
.eye-icon {
  font-size: 0.8rem;
  background: #fff;            
  border-radius: 50%;          
  padding: 4px;                
  box-shadow: 0 0 2px rgba(0,0,0,0.2); 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

      `}</style>
    </div>
  );
}

