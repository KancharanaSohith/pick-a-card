import SpeakUpApp from "@/components/SpeakUpApp";
import { loadTopicsFromDisk } from "@/lib/load-topics";

export default function Home() {
  const topics = loadTopicsFromDisk();
  return <SpeakUpApp initialTopics={topics} />;
}
