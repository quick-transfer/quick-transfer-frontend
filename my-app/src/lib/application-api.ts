import { ApiError, apiFetch, apiFetchCollection } from '@/lib/api';
import {
  mockClasses,
  mockCourses,
  mockInterviews,
  mockStudents,
  mockUsers,
} from '@/lib/mock-data';
import { apiFirst, createLocalId, readCollection, writeCollection } from '@/lib/offline-store';
import type {
  ClassDTO,
  CourseDTO,
  InterviewDTO,
  StudentDTO,
  UserDTO,
  VacancyDTO,
} from '@/types';
import {
  deleteVacancy as deleteManagerVacancy,
  getPlaces as getManagerPlaces,
  getVacancies as getManagerVacancies,
  getVacancy as getManagerVacancy,
  updateVacancy as updateManagerVacancy,
  type VacancyArea,
  type VacancyShift,
} from '@/lib/manager-api';

import { ROLE_COOKIE_NAME, USER_ID_COOKIE_NAME } from '@/lib/auth';

function readClientCookie(name: string) {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

interface BackendUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface BackendCourse {
  id: string;
  courseName: string;
  coordinatorName: string;
  coordinatorEmail: string;
}

interface BackendClass {
  id: string;
  courseName: string;
  startDate: string;
  finishDate: string;
  status: string;
  shiftClass: string;
  acronym: string;
}

interface BackendInterview {
  id: string;
  interviewerName: string;
  dateTime: string;
  park: string;
  section: string;
  nameStudent: string;
  nameManager: string;
  shift: string;
}

interface BackendStudent {
  id: string;
  name: string;
  email: string;
  averageGrade?: number;
  acronym?: string;
  course?: string;
  statusStudent?: string;
}

function mapUser(item: BackendUser, role: UserDTO['role']): UserDTO {
  return { id: item.id, name: item.name, email: item.email, role, active: true };
}

function mapCourse(item: BackendCourse): CourseDTO {
  return {
    id: item.id,
    name: item.courseName,
    code: item.id.slice(0, 8).toUpperCase(),
    coordinatorName: item.coordinatorName,
    totalStudents: 0,
    status: 'ACTIVE',
  };
}

function mapClass(item: BackendClass): ClassDTO {
  const status: ClassDTO['status'] = item.status === 'FINISHED'
    ? 'COMPLETED'
    : item.status === 'ON_GOING' ? 'IN_PROGRESS' : 'PLANNED';
  return {
    id: item.id,
    name: `${item.courseName} - ${item.acronym}`,
    code: item.acronym,
    courseName: item.courseName,
    period: item.shiftClass === 'MORNING' ? 'Matutino' : 'Vespertino',
    totalStudents: 0,
    maxStudents: 25,
    status,
  };
}

function mapInterview(item: BackendInterview): InterviewDTO {
  const [scheduledDate = '', scheduledTimeWithZone = ''] = item.dateTime.split('T');
  return {
    id: item.id,
    candidateName: item.nameStudent,
    candidateEmail: '',
    vacancyTitle: [item.park, item.section].filter(Boolean).join(' / '),
    scheduledDate,
    scheduledTime: scheduledTimeWithZone.slice(0, 5),
    interviewerName: item.interviewerName || item.nameManager,
    status: 'SCHEDULED',
  };
}

function mapStudent(item: BackendStudent): StudentDTO {
  const status: StudentDTO['status'] = item.statusStudent === 'ENROLLED'
    ? 'ACTIVE'
    : item.statusStudent === 'FIRED' ? 'PAUSED' : 'COMPLETED';
  return {
    id: item.id,
    name: item.name,
    registration: item.id.slice(0, 8).toUpperCase(),
    email: item.email,
    courseName: item.course ?? '',
    className: item.acronym ?? '',
    status,
    performanceGrade: item.averageGrade,
  };
}

function replaceLocal<T extends { id: string }>(key: string, seed: readonly T[], value: T) {
  const current = readCollection(key, seed);
  writeCollection(key, current.map((item) => item.id === value.id ? value : item));
  return value;
}

function deleteLocal<T extends { id: string }>(key: string, seed: readonly T[], id: string) {
  writeCollection(key, readCollection(key, seed).filter((item) => item.id !== id));
  return {};
}

export function getAdminVacancies() {
  return getManagerVacancies().then((data): VacancyDTO[] => data.map((item) => ({
    id: item.id, title: item.name, department: item.section,
    location: item.park, totalSpots: item.numbersVacancies,
    filledSpots: 0, status: 'OPEN',
  })));
}

export async function updateAdminVacancy(item: VacancyDTO) {
  const [current, places] = await Promise.all([
    getManagerVacancy(item.id),
    getManagerPlaces(),
  ]);
  const place = places.find((value) =>
    value.park === item.location || value.placeName === item.location
  ) ?? places[0];
  if (!place) throw new Error('Cadastre um local antes de atualizar a vaga.');
  const updated = await updateManagerVacancy(item.id, {
    name: item.title,
    description: item.department,
    area: current.area as VacancyArea,
    shift: current.shift as VacancyShift,
    placeId: place.id,
  });
  return {
    ...item,
    title: updated.name,
    department: updated.section,
    location: updated.park,
  };
}

export async function deleteAdminVacancy(id: string) {
  return deleteManagerVacancy(id);
}

export function getAppUsers() {
  return apiFirst(
    async () => {
      const [admins, managers, coordinators] = await Promise.all([
        apiFetchCollection<BackendUser>('/admin/find/all'),
        apiFetchCollection<BackendUser>('/manager/find/all'),
        apiFetchCollection<BackendUser>('/coordinator/find/all'),
      ]);
      return [
        ...admins.map((item) => mapUser(item, 'ADMIN')),
        ...managers.map((item) => mapUser(item, 'MANAGER')),
        ...coordinators.map((item) => mapUser(item, 'COORDINATOR')),
      ];
    },
    () => readCollection('users', mockUsers)
  );
}

export function updateAppUser(user: UserDTO) {
  return apiFirst(
    async () => {
      const updated = await apiFetch<BackendUser>(`/user/update/${encodeURIComponent(user.id)}`, {
        method: 'PATCH', body: JSON.stringify({ name: user.name }),
      });
      return { ...user, name: updated.name, email: updated.email };
    },
    () => replaceLocal('users', mockUsers, user)
  );
}

export function deleteAppUser(id: string) {
  return apiFirst(
    () => apiFetch(`/user/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => deleteLocal('users', mockUsers, id)
  );
}

export function getCourses() {
  return apiFirst(
    async () => (await apiFetchCollection<BackendCourse>('/course/find/all')).map(mapCourse),
    () => readCollection('courses', mockCourses)
  );
}

export function createCourse(input: Omit<CourseDTO, 'id'>) {
  return apiFirst(
    async () => {
      const role = readClientCookie(ROLE_COOKIE_NAME)?.toUpperCase();
      let coordinatorId = role === 'COORDINATOR'
        ? readClientCookie(USER_ID_COOKIE_NAME)
        : undefined;

      if (!coordinatorId) {
        const coordinators = await apiFetchCollection<BackendUser>('/coordinator/find/all');
        coordinatorId = coordinators.find((item) =>
          item.name === input.coordinatorName ||
          item.username === input.coordinatorName ||
          item.email === input.coordinatorName
        )?.id;
      }

      if (!coordinatorId) {
        throw new ApiError('Não foi possível identificar o coordenador responsável.', 422);
      }
      const created = await apiFetch<BackendCourse>('/course/create', {
        method: 'POST',
        body: JSON.stringify({ name: input.name, coordinatorId }),
      });
      return mapCourse(created);
    },
    () => {
      const created = { id: createLocalId('crs'), ...input };
      writeCollection('courses', [...readCollection('courses', mockCourses), created]);
      return created;
    }
  );
}

export function updateCourse(course: CourseDTO) {
  return apiFirst(
    async () => {
      const role = readClientCookie(ROLE_COOKIE_NAME)?.toUpperCase();
      let coordinatorId = role === 'COORDINATOR'
        ? readClientCookie(USER_ID_COOKIE_NAME)
        : undefined;
      if (!coordinatorId) {
        const coordinators = await apiFetchCollection<BackendUser>('/coordinator/find/all');
        coordinatorId = coordinators.find((item) =>
          item.name === course.coordinatorName ||
          item.username === course.coordinatorName ||
          item.email === course.coordinatorName
        )?.id;
      }
      const updated = await apiFetch<BackendCourse>(`/course/update/${encodeURIComponent(course.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: course.name,
          ...(coordinatorId ? { coordinatorId } : {}),
        }),
      });
      return mapCourse(updated);
    },
    () => replaceLocal('courses', mockCourses, course)
  );
}

export function deleteCourse(id: string) {
  return apiFirst(
    () => apiFetch(`/course/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => deleteLocal('courses', mockCourses, id)
  );
}

export function getClasses() {
  return apiFirst(
    async () => (await apiFetchCollection<BackendClass>('/class/find/all')).map(mapClass),
    () => readCollection('classes', mockClasses)
  );
}

export function createClass(input: Omit<ClassDTO, 'id'> & {
  courseId?: string;
  startDate?: string;
  finishDate?: string;
  studentIds?: string[];
}) {
  return apiFirst(
    async () => {
      if (!input.courseId || !input.startDate || !input.finishDate) {
        throw new ApiError('Informe curso, data inicial e data final da turma.', 422);
      }
      const created = await apiFetch<BackendClass>('/class/create', {
        method: 'POST',
        body: JSON.stringify({
          courseId: input.courseId,
          startDate: input.startDate,
          finishDate: input.finishDate,
          status: input.status === 'COMPLETED' ? 'FINISHED' : input.status === 'IN_PROGRESS' ? 'ON_GOING' : 'NOT_STARTED',
          shiftClass: input.period === 'Matutino' ? 'MORNING' : 'AFTERNOON',
          acronym: input.code,
        }),
      });
      await Promise.all((input.studentIds ?? []).map((studentId) =>
        apiFetch(`/student/update/${encodeURIComponent(studentId)}`, {
          method: 'PATCH', body: JSON.stringify({ classId: created.id }),
        })
      ));
      return mapClass(created);
    },
    () => {
      const created: ClassDTO = {
        id: createLocalId('cls'), name: input.name, code: input.code,
        courseName: input.courseName, period: input.period,
        totalStudents: input.totalStudents, maxStudents: input.maxStudents,
        status: input.status,
      };
      writeCollection('classes', [...readCollection('classes', mockClasses), created]);
      return created;
    }
  );
}

export function updateClass(item: ClassDTO) {
  return apiFirst(
    async () => mapClass(await apiFetch<BackendClass>(`/class/update/${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        acronym: item.code,
        shiftClass: item.period === 'Matutino' ? 'MORNING' : 'AFTERNOON',
        status: item.status === 'COMPLETED' ? 'FINISHED' : item.status === 'IN_PROGRESS' ? 'ON_GOING' : 'NOT_STARTED',
      }),
    })),
    () => replaceLocal('classes', mockClasses, item)
  );
}

export function deleteClass(id: string) {
  return apiFirst(
    () => apiFetch(`/class/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => deleteLocal('classes', mockClasses, id)
  );
}

export function getAdminInterviews() {
  return apiFirst(
    async () => (await apiFetchCollection<BackendInterview>('/interview/find/all')).map(mapInterview),
    () => readCollection('admin-interviews', mockInterviews)
  );
}

export function getAppStudents() {
  return apiFirst(
    async () => (await apiFetchCollection<BackendStudent>('/student/find/all')).map(mapStudent),
    () => readCollection('students', mockStudents)
  );
}

export interface CreateStudentInput {
  name: string;
  email: string;
  age: number;
  classId: string;
}

export function createAppStudent(input: CreateStudentInput) {
  return apiFetch<BackendStudent>('/student/create', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      statusStudentInterview: 'NOT_ASSOCIATED',
      hasSeenEmail: false,
    }),
  }).then(mapStudent);
}

export function updateAppStudent(student: StudentDTO) {
  return apiFirst(
    async () => mapStudent(await apiFetch<BackendStudent>(`/student/update/${encodeURIComponent(student.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: student.name,
        email: student.email,
        averageGrade: student.performanceGrade,
        statusStudent: student.status === 'ACTIVE' ? 'ENROLLED' : student.status === 'PAUSED' ? 'FIRED' : 'LEFT',
      }),
    })),
    () => replaceLocal('students', mockStudents, student)
  );
}

export async function directStudentToVacancy(studentId: string, vacancyId: string) {
  void studentId;
  void vacancyId;
  throw new ApiError(
    'A API atual não possui um endpoint que associe diretamente um aluno a uma vaga.',
    501
  );
}
