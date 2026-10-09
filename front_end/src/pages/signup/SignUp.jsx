import React, { useState } from "react";
import GenderCheckBox from "./GenderCheckBox";
import { Link } from "react-router-dom";
import useSignup from "../../hooks/useSignup";

export default function Signup() {
  const { loading, signup } = useSignup(); // ⬅️ now you have access to signup()

  const [inputes, setInput] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const checkboxChangeHandler = (gender) => {
    setInput({ ...inputes, gender });
  };

  const submitHandler = async (e) => {
    e.preventDefault(); // prevent the page to reload

    //  we can add signup functionality here->but this makes our code messy and ugly-->we use Hooks

    await signup(inputes);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      {/* Glass Card */}
      <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
          Create Account
        </h2>

        {/* Full Name */}
        <form onSubmit={submitHandler}>
          <label className="form-control w-full mb-5">
            <div className="label my-2">
              <span className="label-text text-white/90">Full Name</span>
            </div>
            <input
              type="text"
              placeholder="your full name"
              className="px-2 py-0.5 rounded-s-sm input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputes.fullName}
              onChange={(e) =>
                setInput({ ...inputes, fullName: e.target.value })
              }
            />
          </label>
          {/* Username */}
          <label className="form-control w-full mb-5">
            <div className="label my-2">
              <span className="label-text text-white/90">Username</span>
            </div>
            <input
              type="text"
              placeholder="choose a username"
              className="px-2 py-0.5 rounded-s-sm input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputes.username}
              onChange={(e) =>
                setInput({ ...inputes, username: e.target.value })
              }
            />
          </label>
          {/* Password */}
          <label className="form-control w-full mb-5">
            <div className="label my-2">
              <span className="label-text text-white/90">Password</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="px-2 py-0.5 rounded-s-sm input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputes.password}
              onChange={(e) =>
                setInput({ ...inputes, password: e.target.value })
              }
            />
          </label>
          {/* Confirm Password */}
          <label className="form-control w-full mb-6">
            <div className="label my-2">
              <span className="label-text text-white/90">Confirm Password</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="px-2 py-0.5 rounded-s-sm input input-bordered w-full bg-[#0E1A29] border-gray/50 text-white placeholder-white/60 backdrop-blur-md"
              value={inputes.confirmPassword}
              onChange={(e) =>
                setInput({ ...inputes, confirmPassword: e.target.value })
              }
            />
          </label>
          <GenderCheckBox
            onCheckboxChange={checkboxChangeHandler}
            selectedGender={inputes.gender}
          ></GenderCheckBox>
          {/* Signup Button */}
          <button
            className="mt-4 px-2 py-0.5 rounded-s-sm btn btn-primary w-full font-semibold bg-[#0E1A29] border-gray/50 hover:bg-orange-600 transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              " Sign Up "
            )}
          </button>
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/70 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          {/* Login Link */}
          <div className="text-center text-white/80">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="text-orange-300 hover:text-orange-400 font-medium transition cursor-pointer"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
