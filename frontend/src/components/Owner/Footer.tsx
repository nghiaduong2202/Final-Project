import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="w-full bg-[#e6e6e6] px-4 md:px-6 py-4">
      <div className="w-full max-w-[1156px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="font-roboto text-xs md:text-sm leading-4 text-[#191919] text-center md:text-left order-2 md:order-1">
          Copyright @ 2023 Safelet. All rights reserved.
        </div>

        <div className="flex flex-row items-center gap-[15px] order-1 md:order-2">
          <a href="/terms" className="font-roboto text-xs md:text-sm font-bold leading-4 text-[#5858fa] no-underline cursor-pointer">
            Terms of Use
          </a>
          <div className="w-[1px] h-5 bg-black" />
          <a href="/privacy" className="font-roboto text-xs md:text-sm font-bold leading-4 text-[#5858fa] no-underline cursor-pointer">
            Privacy Policy
          </a>
        </div>

        <div className="font-roboto text-xs md:text-sm leading-4 text-[#191919] hidden md:block order-3">
          Hand Crafted & made with Love
        </div>
      </div>
    </div>
  );
};

export default Footer;

