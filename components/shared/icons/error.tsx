export default function Error({ className }: { className?: string }) {
  return (
    <svg
      fill="currentColor"
      x="0px"
      y="0px"
      viewBox="0 0 512 512"
      enableBackground="new 0 0 512 512"
      xmlSpace="preserve"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M256,0C114.6,0,0,114.6,0,256s114.6,256,256,256s256-114.6,256-256S397.4,0,256,0z M64,256c0-106.1,86-192,192-192
      c42.1,0,81,13.7,112.6,36.7L100.7,368.6C77.7,337,64,298.1,64,256z M256,448c-42.1,0-81-13.7-112.6-36.7l267.9-267.9
      c23,31.7,36.7,70.5,36.7,112.6C448,362.1,362,448,256,448z"
      />
    </svg>
  );
}
