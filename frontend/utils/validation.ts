export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Philippine phone number format
  const phoneRegex = /^(09|\+639)\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateIdentifier = (
  identifier: string,
): {
  isValid: boolean;
  type: 'email' | 'phone' | 'unknown';
} => {
  const trimmed = identifier.trim();

  if (validateEmail(trimmed)) {
    return { isValid: true, type: 'email' };
  }

  if (validatePhoneNumber(trimmed)) {
    return { isValid: true, type: 'phone' };
  }

  return { isValid: false, type: 'unknown' };
};
