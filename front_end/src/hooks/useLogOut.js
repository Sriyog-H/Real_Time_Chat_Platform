import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const UseLogOut = () => {
  const [loading, setLoading] = useState(false);
  const { authUser, setAuthUser } = useContext(AuthContext);

  const logout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.removeItem("chat_user");
      setAuthUser(null);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { loading, logout };
};
