'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getAppStudents, getClasses } from '@/lib/application-api';
import { cn } from '@/lib/utils';
import type { ClassDTO, StudentDTO } from '@/types';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [classItem, setClassItem] = useState<ClassDTO | null>(null);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getClasses(), getAppStudents()])
      .then(([classes, studentData]) => {
        const found = classes.find((item) => item.id === id);
        if (!found) {
          setError('Turma não encontrada.');
          return;
        }
        setClassItem(found);
        setStudents(studentData.filter((student) => student.className === found.name));
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a turma.'));
  }, [id]);

  return (
    <AppShell breadcrumbs={[{ label: 'Turmas', href: '/classes' }, { label: classItem?.name ?? 'Detalhes' }]}>
      <div className='space-y-6'>
        <PageHeader
          title={classItem?.name ?? 'Detalhes da turma'}
          description={classItem ? `${classItem.courseName} - ${classItem.period}` : 'Carregando informações...'}
          actions={
            <Link href='/classes' className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
              <ArrowLeft className='size-4' /> Voltar
            </Link>
          }
        />
        {error && <div role='alert' className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>{error}</div>}
        {classItem && (
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='rounded-xl border bg-white p-5'><GraduationCap className='mb-2 size-5 text-primary' /><p className='text-xs text-slate-500'>Código</p><p className='font-bold'>{classItem.code}</p></div>
            <div className='rounded-xl border bg-white p-5'><Users className='mb-2 size-5 text-primary' /><p className='text-xs text-slate-500'>Ocupação</p><p className='font-bold'>{classItem.totalStudents} / {classItem.maxStudents}</p></div>
            <div className='rounded-xl border bg-white p-5'><p className='text-xs text-slate-500'>Status</p><Badge variant={classItem.status === 'IN_PROGRESS' ? 'success' : 'info'}>{classItem.status === 'IN_PROGRESS' ? 'Em andamento' : 'Planejada'}</Badge></div>
          </div>
        )}
        <section className='rounded-xl border bg-white p-6'>
          <h2 className='mb-4 font-bold'>Alunos da turma</h2>
          {students.length === 0 ? <p className='text-sm text-slate-500'>Nenhum aluno vinculado.</p> : (
            <div className='divide-y'>
              {students.map((student) => <Link key={student.id} href={`/students/${student.id}`} className='flex justify-between py-3 text-sm hover:text-primary'><span className='font-semibold'>{student.name}</span><span>{student.registration}</span></Link>)}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
