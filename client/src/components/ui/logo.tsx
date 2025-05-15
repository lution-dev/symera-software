import React from "react";
import symeraLogo from "@assets/symera-icon.png";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src={symeraLogo} 
      alt="Symera Logo" 
      className={className}
    />
  );
};

export default Logo;
