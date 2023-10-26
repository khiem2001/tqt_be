/**
 * Generate OTP
 * @param length
 * @returns
 */
export const generateOTP = async (length: number = 4) => {
  const possibleCharacters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length),
    );
  }
  return result as string;
};
