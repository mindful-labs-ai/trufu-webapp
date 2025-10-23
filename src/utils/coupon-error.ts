const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: '유효하지 않은 쿠폰 코드입니다.',
  already_redeemed: '이미 사용한 쿠폰입니다.',
  missing_code: '쿠폰 코드를 입력해주세요.',
  redeem_failed: '쿠폰 사용에 실패했습니다.',
};

export function parseCouponError(error: Error): string {
  const message = error.message.toLowerCase();

  for (const [key, errorMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return errorMessage;
    }
  }

  return error.message || '쿠폰 사용 중 오류가 발생했습니다.';
}
