import { useRouter } from 'next/navigation';

// 리다이렉션하지 않은 경로
const PUBLIC_PATHS = ['/beta-login', '/help', '/api', '/_next', '/favicon.ico'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

export function redirectToBetaLogin(
  router: ReturnType<typeof useRouter>,
  currentPath?: string
) {
  const redirectUrl =
    currentPath && currentPath !== '/'
      ? `/beta-login?redirect=${encodeURIComponent(currentPath)}`
      : '/beta-login';

  router.push(redirectUrl);
}

/**
 * 리다이렉션 URL에서 원래 경로 추출
 */
export function getRedirectPath(): string {
  if (typeof window === 'undefined') return '/';

  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect');

  return redirectPath && !isPublicPath(redirectPath) ? redirectPath : '/';
}

/**
 * 인증 후 원래 페이지로 리다이렉션
 */
export function redirectAfterAuth(router: ReturnType<typeof useRouter>) {
  const redirectPath = getRedirectPath();
  router.push(redirectPath);
}
