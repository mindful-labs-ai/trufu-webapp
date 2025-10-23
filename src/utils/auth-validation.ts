const MIN_PASSWORD_LENGTH = 8;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmailPassword(
  email: string,
  password: string
): ValidationResult {
  if (!email.trim() || !password.trim()) {
    return {
      isValid: false,
      error: '이메일과 비밀번호를 모두 입력해주세요.',
    };
  }

  return { isValid: true };
}

export function validateSignUp(
  email: string,
  password: string,
  passwordConfirm: string
): ValidationResult {
  const basicValidation = validateEmailPassword(email, password);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (!passwordConfirm.trim()) {
    return {
      isValid: false,
      error: '모든 필드를 입력해주세요.',
    };
  }

  if (password !== passwordConfirm) {
    return {
      isValid: false,
      error: '비밀번호가 일치하지 않습니다.',
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: '비밀번호는 8자 이상이어야 합니다.',
    };
  }

  return { isValid: true };
}
