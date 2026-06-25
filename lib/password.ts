export const PASSWORD_RULES = [
  { label: "Minimal 8 karakter", test: (password: string) => password.length >= 8 },
  { label: "Mengandung huruf kecil", test: (password: string) => /[a-z]/.test(password) },
  { label: "Mengandung huruf besar", test: (password: string) => /[A-Z]/.test(password) },
  { label: "Mengandung angka", test: (password: string) => /[0-9]/.test(password) },
];

export function passwordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
