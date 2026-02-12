export interface LogoProfileProps {
  size?: number;
  className?: string;
}

export function LogoProfile({ size = 1024, className }: LogoProfileProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="512" cy="512" r="512" fill="#1A99E6" />
      <path
        d="M240 280L440 512L240 744"
        stroke="white"
        strokeWidth="80"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M440 280L640 512L440 744"
        stroke="white"
        strokeWidth="80"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <path
        d="M640 280L840 512L640 744"
        stroke="white"
        strokeWidth="80"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
