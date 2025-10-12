export type TokenMode = 'check' | 'consume';

export type TokenBody = {
  type: string;
  amount?: number;
};

export type TokenResp = {
  ok: boolean;
  mode: TokenMode;
  type: string;
  credit: number;
  request_amount?: number;
  allowed?: boolean;
  consumed?: number;
  error?: string;
};
