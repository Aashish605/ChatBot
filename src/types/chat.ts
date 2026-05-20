export interface ChatHistory {
  id?: number;
  from?: string;
  to?: string;
  text: string;
  time?: string;
  seen?: boolean;
  type?: string;
}
