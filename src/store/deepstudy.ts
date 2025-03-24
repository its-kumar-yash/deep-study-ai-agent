import { create } from "zustand";

interface DeepStudyState {
  topic: string;
  questions: string[];
  answers: string[];
  currentQuestion: number;
  isCompleted: boolean;
  isLoading: boolean;
}

interface DeepStudyActions {
  setTopic: (topic: string) => void;
  setQuestions: (questions: string[]) => void;
  setAnswers: (answers: string[]) => void;
  setCurrentQuestion: (index: number) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const initialState: DeepStudyState = {
  topic: "",
  questions: [],
  answers: [],
  currentQuestion: 0,
  isCompleted: false,
  isLoading: false,
};

export const useDeepStudyStore = create<DeepStudyState & DeepStudyActions>(
  (set) => {
    return {
      ...initialState,
      setTopic: (topic: string) => set({ topic }),
      setQuestions: (questions) => set({ questions }),
      setAnswers: (answers: string[]) => set({ answers }),
      setCurrentQuestion: (currentQuestion: number) => set({ currentQuestion }),
      setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
    };
  }
);
