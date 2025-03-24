import { create } from "zustand";

interface DeepStudyState {
  topic: string;
  questions: string[];
}

interface DeepStudyActions {
  setTopic: (topic: string) => void;
  setQuestions: (questions: string[]) => void;
}

export const useDeepStudyStore = create<DeepStudyState & DeepStudyActions>(
  (set) => {
    return {
      topic: "",
      questions: [],
      setTopic: (topic: string) => set({ topic }),
      setQuestions: (questions: string[]) => set({ questions }),
    };
  }
);
