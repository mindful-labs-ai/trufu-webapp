export interface TrufuChatRequest {
  intent: {
    id: string;
    name: string;
  };
  userRequest: {
    timezone: string;
    params: {
      ignoreMe?: string;
    };
    utterance: string;
    lang: string | null;
    user: {
      id: string;
      type: string;
      properties: Record<string, unknown>;
    };
  };
  bot: {
    id: string;
    name: string;
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
