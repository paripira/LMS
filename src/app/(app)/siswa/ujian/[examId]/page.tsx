import { cookies } from 'next/headers';
import { verifySession, COOKIE } from '@/lib/session';
import ExamRunner from '@/components/cbt/ExamRunner';

export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const s = await verifySession((await cookies()).get(COOKIE)?.value);
  if (!s?.studentId) return <p className="p-8 text-center text-slate-500">Akun Anda tidak terhubung dengan data siswa.</p>;
  return <ExamRunner examId={examId} studentId={s.studentId} />;
}
