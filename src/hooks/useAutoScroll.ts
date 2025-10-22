import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoScroll(messageCount: number, isLoadingHistory: boolean) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessageCountRef = useRef(messageCount);
  const shouldAutoScrollRef = useRef(shouldAutoScroll);

  useEffect(() => {
    shouldAutoScrollRef.current = shouldAutoScroll;
  }, [shouldAutoScroll]);

  const scrollToBottom = useCallback((force = false) => {
    if (shouldAutoScrollRef.current || force) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      setShouldAutoScroll(isAtBottom);
      setIsUserScrolling(!isAtBottom);
    }
  }, []);

  useEffect(() => {
    if (
      !isLoadingHistory &&
      messageCount > 0 &&
      messageCount !== prevMessageCountRef.current
    ) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(false);
      }, 300);

      prevMessageCountRef.current = messageCount;
      return () => clearTimeout(timeoutId);
    }
  }, [messageCount, isLoadingHistory, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    messagesEndRef,
    chatContainerRef,
    isUserScrolling,
    shouldAutoScroll,
    scrollToBottom,
    setShouldAutoScroll,
    handleScroll,
  };
}
