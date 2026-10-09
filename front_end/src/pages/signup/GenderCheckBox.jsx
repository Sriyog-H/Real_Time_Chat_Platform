import React from "react";

const GenderCheckBox = ({ onCheckboxChange, selectedGender }) => {
  return (
    <div className="flex gap-6 p-1 mt-4 ">
      <div className="form-control">
        <label
          className={`lable gap-3 cursor-pointer ${
            selectedGender === "male" ? "selected" : ""
          }`}
        >
          <span className="lable-text">Male</span>
          <input
            type="checkbox"
            className="checkbox border-slate-900 inline-block mx-2"
            checked={selectedGender === "male"}
            onChange={() => onCheckboxChange("male")}
          />
        </label>
      </div>
      <div className="form-control">
        <label
          className={`lable gap-2 cursor-pointer ${
            selectedGender === "female" ? "selected" : ""
          }`}
        >
          <span className="lable-text">Female</span>
          <input
            type="checkbox"
            className="checkbox border-slate-900 inline-block mx-2"
            checked={selectedGender === "female"}
            onChange={() => onCheckboxChange("female")}
          />
        </label>
      </div>
    </div>
  );
};

export default GenderCheckBox;
