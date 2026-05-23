export interface Message {
  id: number | string;
  text: string;
  sender: "me" | "other";
  time: string;
}
