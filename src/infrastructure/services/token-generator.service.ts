import { randomBytes, randomUUID } from 'crypto';
import { ITokenGenerator } from '../../domain/interfaces/beta-access.interfaces';

export class TokenGeneratorService implements ITokenGenerator {
  private readonly characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  /**
   * 랜덤 인증 토큰을 생성합니다
   * 예: eGSe9Dwg52k
   */
  generateAuthToken(length: number = 12): string {
    // crypto.randomBytes를 사용하여 보안적으로 안전한 랜덤 토큰 생성
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += this.characters[bytes[i] % this.characters.length];
    }

    return result;
  }

  /**
   * UUID를 생성합니다
   */
  generateUuid(): string {
    return randomUUID();
  }

  /**
   * 알파벳과 숫자만 포함된 읽기 쉬운 토큰을 생성합니다
   */
  generateReadableToken(length: number = 8): string {
    // 혼동하기 쉬운 문자 제거 (0, O, I, l, 1 등)
    const readableChars =
      'ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += readableChars[bytes[i] % readableChars.length];
    }

    return result;
  }

  /**
   * 숫자로만 구성된 PIN을 생성합니다
   */
  generateNumericPin(length: number = 6): string {
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += (bytes[i] % 10).toString();
    }

    return result;
  }
}
