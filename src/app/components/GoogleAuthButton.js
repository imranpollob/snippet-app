"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "../../../firebase";

const GoogleAuthButton = () => {
  const [user, setUser] = useState(null);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google Sign In", error);
    }
  };

  const signOutFromGoogle = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during Google Sign Out", error);
    }
  };

  const displayName = useMemo(() => {
    if (!user) {
      return "Guest mode";
    }

    if (user.displayName) {
      return user.displayName.split(" ")[0];
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "Creator";
  }, [user]);

  const avatarSrc = user?.photoURL || "/robot-avatar.jpg";

  return (
    <div className="auth-chip" role="group" aria-label="Authentication status">
      <div className="auth-avatar">
        <img src={avatarSrc} alt={user ? `${displayName}'s avatar` : "Guest avatar"} />
      </div>
      <div className="auth-meta">
        <span className="auth-name">{displayName}</span>
        <button
          type="button"
          className="auth-action"
          onClick={user ? signOutFromGoogle : signInWithGoogle}
        >
          {user ? "Sign out" : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthButton;
