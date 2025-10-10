import { useQuotaStore } from '@/stores/quotaStore';

export const useQuota = (type: string) => {
  const status = useQuotaStore(s => s.statusOf(type));
  const check = (amount: number) =>
    useQuotaStore.getState().check(type, amount);
  const consume = (amount: number) =>
    useQuotaStore.getState().consume(type, amount);
  const withQuota = <T>(
    planAmount: number,
    action: () => Promise<T>,
    opts: { finalizeAmount: (r: T) => number }
  ) => useQuotaStore.getState().withQuota(type, planAmount, action, opts);

  return { status, check, consume, withQuota };
};

// HOW TO USE :
//
// export const ExampleButton = () => {
//   const { status, withQuota } = useQuota('chat'); // 타입 키: 'chat' 등
//   const onClick = async () => {
//     try {
//       const result = await withQuota(
//         500, // 예측 토큰
//         async () => {
//           // 실제 작업
//           const r = await fetch('/api/trufu-ai-chat', { method: 'POST' });
//           const json = await r.json();
//           return { ...json, tokenUsed: json.tokenUsage ?? 500 };
//         },
//         {
//           finalizeAmount: r => r.tokenUsed, // 실제 사용량 반영
//         }
//       );
//       console.log('done', result);
//     } catch (e: any) {
//       if (e?.code === 'quota_exceeded') {
//         alert('토큰 한도를 초과했습니다.');
//       } else {
//         alert(`실패: ${e?.message ?? e}`);
//       }
//     }
//   };

//   return (
//     <button disabled={status.updating} onClick={onClick}>
//       {status.updating ? '확인 중...' : `생성 (남은 ${status.remaining})`}
//     </button>
//   );
// }
