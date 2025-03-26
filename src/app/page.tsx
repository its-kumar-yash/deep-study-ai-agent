import QnA from "@/components/ui/deep-study/QnA";
import UserInput from "@/components/ui/deep-study/UserInput";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16">
      
      <div className="fixed top-0 left-0 w-full h-full object-cover  -z-10 bg-black/30">
          <Image src={'/background.jpg'} alt="Deep Research AI Agent" className="w-full h-full object-cover opacity-50" width={500} height={500} />
      </div>

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
