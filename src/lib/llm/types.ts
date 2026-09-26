export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * LLM 연결부. 화면·API 코드는 이 인터페이스만 안다.
 * 지금은 목업(mock.ts), 나중에 Claude 구현체를 같은 모양으로 추가한다.
 */
export interface LLMProvider {
  streamReply(input: { system: string; messages: ChatMessage[] }): AsyncIterable<string>;
}
