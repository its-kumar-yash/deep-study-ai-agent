"use client"

import { useDeepStudyStore } from '@/store/deepstudy'
import React from 'react'
import QuestionForm from './QuestionForm';

export default function QnA() {
  // const {questions} = useDeepStudyStore();
  // if(questions.length === 0) return null;
  return (
    <div className='flex gap-4 w-full flex-col items-center mb-16'>
      <QuestionForm/>
    </div>
  )
}
