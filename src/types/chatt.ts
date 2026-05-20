export interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}