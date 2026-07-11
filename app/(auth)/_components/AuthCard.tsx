interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="flex flex-col items-center bg-white/10 border border-[#bcbcbc] rounded-2xl md:rounded-[26px] shadow-sm md:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-4 py-6 md:px-5 md:py-[26px] w-full max-w-[340px] lg:max-w-[440px]">
      {children}
    </div>
  );
}
