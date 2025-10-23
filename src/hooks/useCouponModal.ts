import { useState, useEffect } from 'react';

interface UseCouponModalProps {
  creditAmount?: number;
}

export function useCouponModal({ creditAmount }: UseCouponModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasManuallyClosedModal, setHasManuallyClosedModal] = useState(false);

  const isZeroCredit = creditAmount === 0;

  useEffect(() => {
    if (isZeroCredit && !isOpen && !hasManuallyClosedModal) {
      setIsOpen(true);
    }

    if (creditAmount && creditAmount > 0 && hasManuallyClosedModal) {
      setHasManuallyClosedModal(false);
    }
  }, [creditAmount, isOpen, hasManuallyClosedModal, isZeroCredit]);

  const open = () => {
    setIsOpen(true);
    setHasManuallyClosedModal(false);
  };

  const close = () => {
    setIsOpen(false);
    setHasManuallyClosedModal(true);
  };

  return {
    isOpen,
    isZeroCredit,
    open,
    close,
  };
}
