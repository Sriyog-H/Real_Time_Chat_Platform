import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async ({ username, password }) => {
    const success = errorhandler({ username, password });

    if (!success) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      //   store the user to localstorage
      localStorage.setItem("chat_user", JSON.stringify(data));

      // set the authUser
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};

export default useLogin;

function errorhandler({ username, password }) {
  if (!username || !password) {
    toast.error("Please fill in all fields ");
    return false;
  }
  if (password.length < 6) {
    toast.error("Password must be at least 6 character");
    return false;
  }
  return true;
}
