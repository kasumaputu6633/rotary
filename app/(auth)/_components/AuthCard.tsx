interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="flex flex-col items-center bg-white/10 border border-[#bcbcbc] rounded-[26px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-5 py-[26px] w-[440px]">
      {children}
    </div>
  );
}
