const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Password should be at least': '비밀번호는 8자 이상이어야 합니다.',
  'Invalid email': '유효하지 않은 이메일 형식입니다.',
};

export function parseAuthError(error: Error): string {
  const message = error.message;

  for (const [key, errorMessage] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return errorMessage;
    }
  }

  return message || '알 수 없는 오류가 발생했습니다.';
}
