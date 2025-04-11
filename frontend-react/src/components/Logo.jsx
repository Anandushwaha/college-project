import React from "react";

const Logo = ({ size = "medium", colored = true }) => {
  // Define size values
  const sizes = {
    small: { width: 30, height: 30, fontSize: 14 },
    medium: { width: 40, height: 40, fontSize: 18 },
    large: { width: 50, height: 50, fontSize: 22 },
  };

  // Logo styles
  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "bold",
  };

  // Icon styles
  const iconStyle = {
    width: sizes[size].width,
    height: sizes[size].height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colored
      ? "linear-gradient(135deg, #3498db, #8e44ad)"
      : "#2c3e50",
    borderRadius: "8px",
    color: "white",
    fontSize: sizes[size].fontSize,
  };

  // Text styles
  const textStyle = {
    fontSize: sizes[size].fontSize,
    color: colored ? "#2c3e50" : "inherit",
    letterSpacing: "0.5px",
  };

  return (
    <div className="logo-container" style={logoStyle}>
      <div className="logo-icon" style={iconStyle}>
        LMS
      </div>
      <div className="logo-text" style={textStyle}>
        EduConnect
      </div>
    </div>
  );
};

export default Logo;
