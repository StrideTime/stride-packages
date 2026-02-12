export interface LogoHorizontalProps {
  variant?: "light" | "dark";
  width?: number;
  height?: number;
  className?: string;
}

export function LogoHorizontal({
  variant = "light",
  width = 1000,
  height = 400,
  className,
}: LogoHorizontalProps) {
  const bgColor = variant === "dark" ? "#1F2937" : "#1A99E6";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1000 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="1000" height="400" rx="80" fill={bgColor} />
      <path
        d="M94 109L172 200L94 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M172 109L250 200L172 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <path
        d="M250 109L328 200L250 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="420"
        y="245"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="140"
        fontWeight="700"
        fill="white"
      >
        Stride
      </text>
    </svg>
  );
}
