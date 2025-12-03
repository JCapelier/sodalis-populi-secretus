import { EasterEggResult, EasterEggType } from "@/services/EasterEggService";
import React from "react";

interface EasterEggProps {
  easterEgg: EasterEggResult | null;
  drafterName: string | undefined;
}

const EasterEgg: React.FC<EasterEggProps> = ({ easterEgg }) => {

  if (!easterEgg) return null;

  switch (easterEgg.type) {
    case EasterEggType.Text:
      return (
        <div className="mt-4 text-center text-green-700 font-semibold text-base">
          <span>{easterEgg.value}</span>
        </div>
      );
    case EasterEggType.Link:
      return (
        <div className="mt-4 text-center text-green-700 font-semibold text-base">
          <a href={easterEgg.value} target="_blank" rel="noopener noreferrer">
            {easterEgg.value}
          </a>
        </div>
      );
    case EasterEggType.Button:
      return (
        <div className="mt-4 text-center text-green-700 font-semibold text-base">
          <button onClick={easterEgg.onClick}>{easterEgg.label}</button>
        </div>
      );
    default:
      return null;
  }
};

export default EasterEgg;
