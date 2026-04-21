import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label
        htmlFor={id}
        className="font-poppins font-semibold text-[14px] text-black"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`bg-[rgba(130,130,130,0.27)] border h-[32px] rounded-[9px] w-full px-3 text-[13px] font-poppins outline-none focus:bg-white transition-colors ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-[#979797] focus:border-[#17458f]"
        }`}
      />
      {error && (
        <p className="font-poppins text-[12px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
