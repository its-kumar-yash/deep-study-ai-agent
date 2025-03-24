"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  input: z.string().min(2).max(200),
});

export default function UserInput() {
  const [isLoaded, setIsLoaded] = useState(false);

  // useForm is a custom hook for managing forms in React.
  // It is built on top of React Hook Form, a library that provides a simple way to manage forms in React.
  // useForm takes an object as an argument, which contains the schema for the form fields.
  // The schema is defined using zod, a TypeScript-first schema declaration and validation library.
  // The schema defines the shape of the form data, including the type and constraints for each field.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
    },
  });
  // onSubmit is a function that is called when the form is submitted.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-baseline justify-center gap-4 w-[90vw] sm:w-[80vw] xl:w-[50vw]">
        <FormField
          control={form.control}
          name="input"
          render={({ field }) => (
            <FormItem className="flex-1 w-full">
              <FormControl>
                <Input placeholder="Enter your research topic" {...field}
                className="rounded-full w-full flex-1 p-4 py-4 sm:py-6 placeholder:text-sm bg-white/60 backdrop-blur-sm border-black/10 border-solid shadow-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="rounded-full px-6 cursor-pointer h-12 w-28">Submit</Button>
      </form>
    </Form>
  );
}
