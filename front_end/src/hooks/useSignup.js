import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
const notify = (msg) => toast(msg);

const useSignup = () => {
  const [loading, setLoading] = useState(false);

  const { authUser, setAuthUser } = useAuthContext();

  const signup = async ({
    fullName,
    username,
    password,
    confirmPassword,
    gender,
  }) => {
    const success = handleInputErrors({
      fullName,
      username,
      password,
      confirmPassword,
      gender,
    });

    if (!success) return;

    setLoading(true);

    // handle the signup functionality here
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          password,
          confirmPassword,
          gender,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // localStorage --> to know if the user logged in or not in case we refresh the signup page
      localStorage.setItem("chat_user", JSON.stringify(data));

      // Context

      setAuthUser(data)

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

function handleInputErrors({
  fullName,
  username,
  password,
  confirmPassword,
  gender,
}) {
  if (!fullName || !username || !password || !confirmPassword || !gender) {
    toast.error("Please fill in all fields");
    return false;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  if (password.length < 6) {
    // previously this toast fired but signup still went ahead — the
    // missing `return false` meant a sub-6-character password was
    // rejected only in the message, not in behavior
    toast.error("Password must be at least 6 character");
    return false;
  }

  return true;
}
