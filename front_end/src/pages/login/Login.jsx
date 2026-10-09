import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

export default function Login() {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const { loading, login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // hook for handling the login
    await login(inputs);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      {/* Glass Card */}
      <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label className="form-control w-full mb-5">
            <div className="label my-2">
              <span className="label-text text-white/90">Username</span>
            </div>
            <input
              type="text"
              placeholder="your username"
              className="px-2 rounded-s-sm py-0.5 input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputs.username}
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
            />
          </label>

          {/* Password */}
          <label className="form-control w-full mb-2">
            <div className="label my-2">
              <span className="label-text text-white/90">Password</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="px-2 rounded-s-sm py-0.5 input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
            />
          </label>

          {/* Login Button */}
          <button
            className="mt-4 px-2 rounded-s-sm py-0.5 btn btn-primary w-full  font-semibold bg-[#0E1A29] border-gray/50 hover:bg-orange-600 transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/70 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Signup */}
          <div className="text-center text-white/80">
            Don’t have an account?{" "}
            <Link
              to={"/signup"}
              className="text-orange-300 hover:text-orange-400 font-medium transition cursor-pointer inline-block "
            >
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
