type AccountVerificationData = {
  email?: string | null;
  emailVerifiedAt?: Date | null;
  phone?: string | null;
  phoneVerifiedAt?: Date | null;
};

export function isEmailVerified(user: AccountVerificationData) {
  return Boolean(user.email?.trim() && user.emailVerifiedAt);
}

export function isPhoneVerified(user: AccountVerificationData) {
  return Boolean(user.phone?.trim() && user.phoneVerifiedAt);
}

export function isContactVerified(user: AccountVerificationData, contact: string) {
  return contact.includes("@") ? isEmailVerified(user) : isPhoneVerified(user);
}

export function getAccountVerificationStatus(user: AccountVerificationData) {
  const emailVerified = isEmailVerified(user);
  const phoneVerified = isPhoneVerified(user);

  return {
    emailVerified,
    phoneVerified,
    sellerReady: emailVerified && phoneVerified,
  };
}
