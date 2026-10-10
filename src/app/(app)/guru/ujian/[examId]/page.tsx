'use client';
import { useParams } from 'next/navigation';
import ResultsPanel from '@/components/ResultsPanel';

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>();
  return <ResultsPanel examId={examId} />;
}
