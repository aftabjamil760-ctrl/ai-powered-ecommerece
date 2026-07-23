import { FaSun } from "react-icons/fa";
import { GiPalmTree } from "react-icons/gi";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-full gradient-sun shadow-glow">
        <FaSun className="absolute text-white/80" size={16} />
        <GiPalmTree className="relative text-foreground" size={18} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Summer<span className="text-primary">Nest</span>
      </span>
    </div>
  );
}

