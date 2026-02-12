export interface LogoMarkProps {
  variant?: "primary" | "white";
  size?: number;
  className?: string;
}

export function LogoMark({ variant = "primary", size = 400, className }: LogoMarkProps) {
  const color = variant === "white" ? "#FFFFFF" : "#1A99E6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M94 109L172 200L94 291"
        stroke={color}
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M172 109L250 200L172 291"
        stroke={color}
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <path
        d="M250 109L328 200L250 291"
        stroke={color}
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
