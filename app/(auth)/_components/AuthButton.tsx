interface AuthButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  pending?: boolean;
  onClick?: () => void;
}

export default function AuthButton({ children, disabled, pending, onClick }: AuthButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      disabled={disabled || pending}
      className="bg-[#ffb81d] border border-[#979797] flex items-center justify-center h-[32px] rounded-[9px] w-full px-[10px] transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:brightness-95"
    >
      <span className="font-open-sauce text-[14px] text-black">
        {pending ? "Memproses..." : children}
      </span>
    </button>
  );
}
