export interface LogoStackedProps {
  variant?: "light" | "dark";
  size?: number;
  className?: string;
}

export function LogoStacked({ variant = "light", size = 600, className }: LogoStackedProps) {
  const bgColor = variant === "dark" ? "#1F2937" : "#1A99E6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="600" height="600" rx="80" fill={bgColor} />
      <path
        d="M194 109L272 200L194 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M272 109L350 200L272 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <path
        d="M350 109L428 200L350 291"
        stroke="white"
        strokeWidth="31"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="300"
        y="480"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="120"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
      >
        Stride
      </text>
    </svg>
  );
}
