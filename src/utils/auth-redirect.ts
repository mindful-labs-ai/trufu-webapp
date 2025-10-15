import { useRouter } from 'next/navigation';

const PUBLIC_PATHS = [
  '/email-login',
  '/beta-login',
  '/help',
  '/api',
  '/_next',
  '/favicon.ico',
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

export function redirectToLogin(
  router: ReturnType<typeof useRouter>,
  currentPath?: string
) {
  const redirectUrl =
    currentPath && currentPath !== '/'
      ? `/email-login?redirect=${encodeURIComponent(currentPath)}`
      : '/email-login';

  router.push(redirectUrl);
}

export function getRedirectPath(): string {
  if (typeof window === 'undefined') return '/';

  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect');

  return redirectPath && !isPublicPath(redirectPath) ? redirectPath : '/';
}

export function redirectAfterAuth(router: ReturnType<typeof useRouter>) {
  const redirectPath = getRedirectPath();
  router.push(redirectPath);
}
