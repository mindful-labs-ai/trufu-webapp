'use client';

import { redeemCoupon } from '@/services/coupon.service';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useToast } from '@/contexts/ToastContext';
import { parseCouponError } from '@/utils/coupon-error';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTO_CLOSE_DELAY = 1000;
const CREDIT_TYPE = 'openai';

export const CouponModal = ({ isOpen, onClose }: CouponModalProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const resetForm = () => {
    setCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      showToast('쿠폰 코드를 입력해주세요.', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await redeemCoupon(code);

      if (result.redeemed) {
        showToast(
          `${result.credit_added?.toLocaleString()} 크레딧이 추가되었습니다. (잔액: ${result.credit_after?.toLocaleString()})`,
          'success'
        );
        setCode('');

        queryClient.invalidateQueries({
          queryKey: QUERY_KEY.CREDIT(CREDIT_TYPE),
        });

        setTimeout(() => {
          onClose();
        }, AUTO_CLOSE_DELAY);
      }
    } catch (error) {
      showToast(parseCouponError(error as Error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">크레딧 충전</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-foreground mb-2"
              htmlFor="coupon-code"
            >
              쿠폰 코드
            </label>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="쿠폰 코드 입력"
              disabled={loading}
              className="appearance-none border border-input rounded-lg w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-background uppercase disabled:opacity-50"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-muted-bg disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-medium py-2 px-4"
            >
              {loading ? '확인 중...' : '쿠폰 사용'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              닫기
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>• 쿠폰 코드는 대소문자를 구분하지 않습니다.</p>
          <p>• 각 쿠폰은 한 번만 사용할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
};
