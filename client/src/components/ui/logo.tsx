import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M27.9224 4.99275C20.2231 0.673057 10.3519 4.3118 5.97792 12.1082C1.60392 19.9046 5.12517 29.809 12.8244 34.1287C14.285 34.874 15.8032 35.3746 17.3478 35.6458C20.0871 36.1248 22.9033 35.6953 25.4295 34.3757C29.7647 32.1799 32.2225 27.7656 32.1455 23.1687L41.8178 20.4654C47.3231 18.6688 49.4903 12.1559 46.3209 7.21125C43.1515 2.26659 36.2944 1.7825 31.838 5.92909C30.5635 5.45642 29.2425 5.11258 27.9224 4.99275Z"
        fill="url(#paint0_linear_103_2)"
      />
      <path
        d="M25.4296 34.3758C22.9034 35.6953 20.0872 36.1249 17.3479 35.6459C15.8033 35.3747 14.2851 34.8741 12.8245 34.1288C5.12526 29.809 1.60401 19.9047 5.97801 12.1083C10.352 4.31191 20.2232 0.67317 27.9225 4.99286C35.6219 9.31256 39.1431 19.2169 34.7691 27.0132C33.6105 29.0219 32.1233 30.7092 30.3932 32.0133C28.6807 33.301 27.1001 34.058 25.4296 34.3758Z"
        stroke="url(#paint1_linear_103_2)"
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        d="M41.8177 20.4654L32.1454 23.1687C32.2224 27.7655 29.7646 32.1799 25.4294 34.3757C27.1 34.0578 28.6805 33.3008 30.3931 32.0132C32.1231 30.709 33.6104 29.0217 34.769 27.0131C36.7584 23.4677 36.9329 19.4116 35.6118 15.747C39.2967 15.9916 43.8349 14.7187 46.3208 7.21124C49.4902 12.1559 47.323 18.6688 41.8177 20.4654Z"
        fill="url(#paint2_linear_103_2)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_103_2"
          x1="26.1533"
          y1="3.5"
          x2="26.1533"
          y2="35.867"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A00" />
          <stop offset="1" stopColor="#FF3A3A" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_103_2"
          x1="20.7071"
          y1="3.22421"
          x2="20.7071"
          y2="35.867"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A00" />
          <stop offset="1" stopColor="#FF3A3A" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_103_2"
          x1="35.9825"
          y1="7.21124"
          x2="35.9825"
          y2="34.3757"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A00" />
          <stop offset="1" stopColor="#FF3A3A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
