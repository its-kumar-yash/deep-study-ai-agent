import QnA from "@/components/ui/deep-study/QnA";
import UserInput from "@/components/ui/deep-study/UserInput";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16">
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-8xl  font-bold italic bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent font-playfair-display pb-3 pr-1">
          DeepStudy AI
        </h1>

        <p className="text-gray-600 text-center">
          Enter a topic, answer a few questions, and let DeepStudy AI generate a
          comprehensive research report for you.
        </p>
      </div>
      <UserInput/>
      <QnA/>
    </main>
  );
}
