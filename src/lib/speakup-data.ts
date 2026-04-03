export type Mood = "Casual" | "Deep" | "Professional" | "Personal";

export interface Topic {
  id: number;
  text: string;
  mood: Mood;
  hints: string[];
}
