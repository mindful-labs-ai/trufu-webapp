export type TokenMode = 'check' | 'consume';

export type TokenBody = {
  type: string;
  amount: number;
  mode?: TokenMode;
};

export type TokenResp = {
  ok: boolean;
  mode: TokenMode;
  type: string;
  usage: number;
  limit: number;
  request_amount?: number;
  allowed?: boolean;
  consumed?: number;
  error?: string;
};
