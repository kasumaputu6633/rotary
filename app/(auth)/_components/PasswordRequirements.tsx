import { Icon } from "@iconify/react";

const RULES = [
  { label: "Minimal 8 karakter",          test: (p: string) => p.length >= 8 },
  { label: "Mengandung huruf kecil",       test: (p: string) => /[a-z]/.test(p) },
  { label: "Mengandung huruf besar",       test: (p: string) => /[A-Z]/.test(p) },
  { label: "Mengandung angka",             test: (p: string) => /[0-9]/.test(p) },
];

export const passwordValid = (p: string) => RULES.every((r) => r.test(p));

export default function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null;

  return (
    <ul className="flex flex-col gap-1.5 w-full mt-1">
      {RULES.map(({ label, test }) => {
        const ok = test(password);
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${ok ? "text-green-500" : "text-[#bbb]"}`}>
              <Icon icon={ok ? "lucide:circle-check" : "lucide:circle-x"} width={14} height={14} aria-hidden="true" />
            </span>
            <span className={`font-poppins text-[12px] ${ok ? "text-green-600" : "text-[#aaa]"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
