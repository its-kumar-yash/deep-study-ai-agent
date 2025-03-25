"use client";

import { useDeepStudyStore } from "@/store/deepstudy";
import React, { useEffect } from "react";
import QuestionForm from "./QuestionForm";
import { useChat } from "@ai-sdk/react";

export default function QnA() {
  const { questions, isCompleted, topic, answers, setIsLoading } =
    useDeepStudyStore();

  const { append, data } = useChat({
    api: "/api/deep-study",
  });

  console.log("Data", data);

  useEffect(() => {
    if (isCompleted && questions.length > 0) {
      const clarifications = questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      }));
      append({
        role: "user",
        content: JSON.stringify({ topic, clarifications }),
      });
    }
  }, [isCompleted, questions, topic, answers, append]);
  // if(questions.length === 0) return null;
  return (
    <div className="flex gap-4 w-full flex-col items-center mb-16">
      <QuestionForm />
    </div>
  );
}
