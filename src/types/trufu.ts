export interface TrufuChatRequest {
  userRequest: {
    timezone: string;
    params: {};
    utterance: string;
    lang: string | null;
    user: {
      id: string;
      properties: Record<string, unknown>;
    };
  };
  bot: {
    id: string;
    code: string;
  };
}

export interface TrufuChatResponse {
  version: string;
  template: {
    outputs: Array<TrufuChatSimpleMessage>;
  };
}

export interface TrufuChatMessage {
  chat_hist_id: string;
}
export interface TrufuChatSimpleMessage extends TrufuChatMessage {
  simpleText: {
    text: string;
  };
}
