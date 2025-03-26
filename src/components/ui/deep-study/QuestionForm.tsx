import React from "react";
import { z } from "zod"; // zod is a TypeScript-first schema declaration and validation library.
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "../textarea";
import { useDeepStudyStore } from "@/store/deepstudy";

const formSchema = z.object({
  answer: z.string().min(1, "Answer is required!"),
});

export default function QuestionForm() {
  const {
    questions,
    currentQuestion,
    answers,
    setCurrentQuestion,
    setAnswers,
    setIsCompleted,
    isLoading,
    isCompleted,
  } = useDeepStudyStore();

  console.log(questions);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: answers[currentQuestion] || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = values.answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      form.setValue("answer", answers[currentQuestion + 1] || "");
    } else {
      setIsCompleted(true);
    }
  }

    if(isCompleted) return;

  if (!questions || questions.length === 0 || !questions[currentQuestion])
    return null;

  return (
    <Card className="w-full max-w-[90vw] sm:max-w-[80vw] xl:max-w-[50vw] shadow-none bg-white/60 backdrop-blur-sm border rounded-xl border-black/10 border-solid">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base text-primary/50">
          Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 w-full px-6 sm:px-6">
        <p className="text-base">{questions[currentQuestion]}</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            // className="flex sm:flex-row items-baseline justify-center gap-4 w-[90vw] sm:w-[80vw] xl:w-[50vw]"
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Type your answer here..."
                      {...field}
                      className="px-4 py-2 text-base resize-none placeholder:text-sm border-black/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    form.setValue("answer", answers[currentQuestion - 1] || "");
                  }
                }}
              >
                Previous
              </Button>
              <Button type="submit" disabled={isLoading}>
                {currentQuestion === questions.length - 1
                  ? "Start Research"
                  : "Next"}
              </Button>
            </div>
          </form>
        </Form>
        <div className="h-1 w-full bg-gray-200 rounded">
          <div
            className="h-1 bg-primary rounded transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
