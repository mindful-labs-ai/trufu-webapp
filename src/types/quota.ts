export type QuotaMode = 'check' | 'consume';

export type QuotaBody = {
  type: string;
  amount: number;
  mode?: QuotaMode;
};

export type QuotaResp = {
  ok: boolean;
  mode: QuotaMode;
  type: string;
  usage: number;
  limit: number;
  remaining: number;
  request_amount?: number;
  allowed?: boolean;
  consumed?: number;
  error?: string;
};
