/**
 * Check password matches with the Regex critetia
 * Password must contain at least 8 characters, one uppercase,one lowercase,one number and one special case character with no spaces
 *
 * @param {string} password
 * @returns {boolean}
 */
export const validatePasswordRegex = (password: string): boolean => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])[a-zA-Z0-9_\S]{8,}$/g;
  return pattern.test(password);
};
