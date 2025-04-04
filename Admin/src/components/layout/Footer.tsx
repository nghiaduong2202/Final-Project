import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="w-full min-w-[320px] h-[50px] bg-[#e6e6e6] flex justify-center items-center px-5 box-border">
      <div className="w-full max-w-[1156px] flex flex-row justify-between items-center">
        <div className="font-roboto text-sm leading-4 text-[#191919]">
          Copyright @ 2023 Safelet. All rights reserved.
        </div>

        <div className="flex flex-row items-center gap-[15px]">
          <a href="/terms" className="font-roboto text-sm font-bold leading-4 text-[#5858fa] no-underline cursor-pointer">
            Terms of Use
          </a>
          <div className="w-[1px] h-5 bg-black" />
          <a href="/privacy" className="font-roboto text-sm font-bold leading-4 text-[#5858fa] no-underline cursor-pointer">
            Privacy Policy
          </a>
        </div>

        <div className="font-roboto text-sm leading-4 text-[#191919]">
          Hand Crafted & made with Love
        </div>
      </div>
    </div>
  );
};

export default Footer;

