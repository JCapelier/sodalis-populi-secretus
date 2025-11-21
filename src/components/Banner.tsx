import React from "react";

const Banner: React.FC = () => (
  <div className="w-full bg-gradient-to-r from-blue-700 to-purple-600 py-8 text-center shadow-lg mb-8">
    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg">
      Sodalis Populi Secretus
    </h1>
    <p className="mt-2 text-lg md:text-xl text-white/90 italic font-light">
      Because sometimes, you gotta pair your Populous! <span className="text-white/70">(William Shakespair)</span>
    </p>
  </div>
);

export default Banner;
