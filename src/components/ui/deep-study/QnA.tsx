"use client";

import { useDeepStudyStore } from "@/store/deepstudy";
import React, { useEffect } from "react";
import QuestionForm from "./QuestionForm";
import { useChat } from "@ai-sdk/react";
import ResearchActivity from "./ResearchActivity";
import ResearchReport from "./ResearchReport";
import ResearchTimer from "./ResearchTimer";

export default function QnA() {
  const {
    questions,
    isCompleted,
    topic,
    answers,
    isLoading,
    setIsLoading,
    setActivities,
    setSources,
    setReport,
  } = useDeepStudyStore();

  const { append, data } = useChat({
    api: "/api/deep-study",
  });

  console.log("Data", data);

  useEffect(() => {
    if (!data) return;
    //extract the activites and sources
    const messages = data as unknown[];
    const activites = messages
      .filter(
        (msg) => typeof msg === "object" && (msg as any).type === "activity"
      )
      .map((msg) => (msg as any).content);

    setActivities(activites);
    const sources = activites
      .filter(
        (activity) =>
          activity.type === "extract" && activity.status === "complete"
      )
      .map((activity) => {
        const url = activity.message.split("from ")[1];
        return { url, title: url?.split("/")[2] || url };
      });

    setSources(sources);
    const reportData = messages.find(
      (msg) => typeof msg === "object" && (msg as any).type === "report"
    );
    const report = typeof (reportData as any)?.content === "string" ? (reportData as any).content : "";
    setReport(report);
    setIsLoading(isLoading);
  }, [data, setActivities, setSources, setReport, setIsLoading, isLoading]);

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
      <ResearchActivity />
      <ResearchTimer />
      <ResearchReport />
    </div>
  );
}
