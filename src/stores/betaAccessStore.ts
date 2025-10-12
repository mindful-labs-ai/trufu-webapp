import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BetaAccessService } from '../services/beta-access.service';
import { BetaAccessAuthState } from '../types/beta-access';

interface BetaAccessStore extends BetaAccessAuthState {
  jwtToken?: string; // JWT 토큰 추가
  login: (authToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  validateToken: (
    authToken: string
  ) => Promise<{ success: boolean; isValid?: boolean; error?: string }>;
  setAuthState: (state: Partial<BetaAccessAuthState>) => void;
  checkAuthStatus: () => Promise<void>;
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  isSessionValid: () => Promise<boolean>;
}

export const useBetaAccessStore = create<BetaAccessStore>()(
  persist(
    (set, get) => {
      const betaAccessService = new BetaAccessService();

      return {
        // Initial state
        isAuthenticated: false,
        token: undefined,
        user: undefined,
        jwtToken: undefined,

        // Actions
        login: async (authToken: string) => {
          try {
            const result =
              await betaAccessService.loginWithBetaToken(authToken);

            if (result.success && result.data) {
              // JWT 토큰 저장
              set({ jwtToken: result.data.jwtToken });

              // 로그인 성공 후 인증 상태 확인
              await get().checkAuthStatus();

              return { success: true };
            } else {
              return {
                success: false,
                error: result.error,
              };
            }
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : '로그인에 실패했습니다.',
            };
          }
        },

        logout: async () => {
          try {
            await betaAccessService.signOut();
          } catch (error) {
            console.error('Logout error:', error);
          }

          set({
            isAuthenticated: false,
            token: undefined,
            user: undefined,
            jwtToken: undefined,
          });
        },

        validateToken: async (authToken: string) => {
          try {
            const result = await betaAccessService.validateBetaToken(authToken);
            return result;
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : '토큰 검증에 실패했습니다.',
            };
          }
        },

        setAuthState: (state: Partial<BetaAccessAuthState>) => {
          set(current => ({
            ...current,
            ...state,
          }));
        },

        checkAuthStatus: async () => {
          try {
            console.log('Checking auth status...');

            // 0. 저장된 JWT 토큰이 있으면 복원 시도
            const currentState = get();
            if (currentState.jwtToken) {
              console.log(
                'Found stored JWT token, attempting to restore session...'
              );
              const restoreResult = await betaAccessService.restoreSession(
                currentState.jwtToken
              );
              if (!restoreResult.success) {
                console.warn('Failed to restore session:', restoreResult.error);
                // JWT 토큰이 유효하지 않으면 정리
                set({
                  isAuthenticated: false,
                  token: undefined,
                  user: undefined,
                  jwtToken: undefined,
                });
                return;
              }
            }

            // 1. 현재 세션 유효성 확인
            const isValid = await betaAccessService.isSessionValid();
            console.log('Session valid:', isValid);

            if (!isValid) {
              console.debug('Session is not valid');
              set({
                isAuthenticated: false,
                token: undefined,
                user: undefined,
                jwtToken: undefined,
              });
              return;
            }

            // 2. 현재 사용자 정보 가져오기
            const user = await betaAccessService.getCurrentUser();
            console.log(
              'Current user:',
              user ? { id: user.id, email: user.email } : null
            );

            if (user) {
              set({
                isAuthenticated: true,
                user: {
                  id: user.id,
                  email: user.email,
                },
              });
              console.log('Auth status updated: authenticated');
            } else {
              console.debug('No user found');
              set({
                isAuthenticated: false,
                token: undefined,
                user: undefined,
                jwtToken: undefined,
              });
            }
          } catch (error) {
            console.error('Auth status check failed:', error);
            set({
              isAuthenticated: false,
              token: undefined,
              user: undefined,
              jwtToken: undefined,
            });
          }
        },

        // 새로운 세션 관리 메서드들
        refreshSession: async () => {
          try {
            const result = await betaAccessService.refreshSession();
            if (result.success) {
              // 세션 새로고침 후 인증 상태 재확인
              await get().checkAuthStatus();
            }
            return result;
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : '세션 새로고침에 실패했습니다.',
            };
          }
        },

        isSessionValid: async () => {
          return await betaAccessService.isSessionValid();
        },
      };
    },
    {
      name: 'beta-access-auth',
      // 세션 유지를 위해 jwtToken도 저장
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        jwtToken: state.jwtToken,
        user: state.user
          ? { id: state.user.id, email: state.user.email }
          : undefined,
      }),
    }
  )
);
