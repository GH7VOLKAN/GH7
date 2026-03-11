export function GH7Icon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M 17.34 75.68 L 22.01 67.7 L 30.62 82.83 C 43.8 60.35 59.11 34.24 72.3 11.76 L 4.58 11.07 L 0 3 L 86.26 3.82 C 68.38 34.29 48.39 68.38 30.51 98.85 Z M 8.6 18.13 C 32.32 18.3 36.33 18.55 60.05 18.71 L 40.24 52.48 L 30.72 68.72 L 26.14 60.67 C 32.09 50.54 40.16 36.78 46.1 26.65 C 28.55 26.53 30.73 26.32 13.18 26.2 Z"
      />
    </svg>
  );
}
