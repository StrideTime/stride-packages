export interface LogoTextProps {
  variant?: "light" | "dark" | "primary";
  width?: number;
  height?: number;
  className?: string;
}

export function LogoText({
  variant = "light",
  width = 800,
  height = 200,
  className,
}: LogoTextProps) {
  const colorMap = {
    light: "#111827",
    dark: "#FFFFFF",
    primary: "#1A99E6",
  };

  const color = colorMap[variant];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 800 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="20"
        y="145"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="140"
        fontWeight="700"
        fill={color}
      >
        Stride
      </text>
    </svg>
  );
}
