import { apiFetch, apiFetchCollection } from "@/lib/api";
import { apiFirst, createLocalId, readCollection, writeCollection } from '@/lib/offline-store';

// ── Enumerations ──

// VacancyArea and VacancyShift are kept as open string unions (| string) to
// remain forward-compatible if the backend adds new values before the frontend
// is updated. Exhaustive switch/case over these should always include a default.
export type VacancyArea = "IT" | "MAINTENANCE" | "TOOLING" | "CHEMISTRY";
export type VacancyShift = "FIRST" | "SECOND" | "THIRD" | "FLEXIBLE_SHIFT";

// InterviewStatus tracks the lifecycle of a candidate through the selection process.
// NOT_ASSOCIATED means no interview has been linked to the student yet.
export type InterviewStatus =
  | "NOT_ASSOCIATED"
  | "NOT_SEEN"
  | "DISCARDED"
  | "SEEN"
  | "DISAPPROVED"
  | "HIRED";

// ── API DTOs ──

export interface Vacancy {
  id: string;
  name: string;
  description: string;
  numbersVacancies: number;
  area: VacancyArea | string;
  shift: VacancyShift | string;
  park: string;
  section: string;
}

export interface VacancyInput {
  name: string;
  description: string;
  numbersVacancies: number;
  area: VacancyArea;
  shift: VacancyShift;
  // placeId rather than location string — the backend resolves park/section from the Place entity.
  placeId: string;
  skillIds?: string[];
}

export interface VacancyUpdateInput {
  name: string;
  description: string;
  numbersVacancies?: number;
  area: VacancyArea;
  shift: VacancyShift;
  placeId: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
  averageGrade?: number;
  acronym: string;
  course: string;
  statusStudentInterview: InterviewStatus | string;
  hasSeenEmail: boolean;
  statusStudent: "ENROLLED" | "FIRED" | "LEFT" | string;
}

export interface Skill {
  id: string;
  name: string;
  // TECHNICAL and SOCIOEMOTIONAL are the two current categories; string allows
  // new types without a breaking schema change.
  skillType: "TECHNICAL" | "SOCIOEMOTIONAL" | string;
  grade?: number;
  studentName: string;
}

export interface Place {
  id: string;
  placeName: string;
  park: string;
  section: string;
}

export interface PlaceInput {
  placeName: string;
  // Only two parks currently supported by the backend.
  park: "WEG_I" | "WEG_II";
  section: string;
}

export interface Manager {
  id: string;
  name: string;
  username: string;
  email: string;
  section: string;
}

export type ManagerSection = "IT";

export interface ManagerInput {
  name: string;
  username: string;
  email: string;
  password: string;
  section: ManagerSection;
}

export interface Coordinator {
  id: string;
  name: string;
  username: string;
  email: string;
}

export interface CoordinatorInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface Interview {
  id: string;
  interviewerName: string;
  dateTime: string;
  park: string;
  section: string;
  nameStudent: string;
  nameManager: string;
  shift: string;
}

export interface InterviewInput {
  interviewerName: string;
  // ISO 8601 datetime string expected by the backend — no timezone conversion is done here.
  dateTime: string;
  placeId: string;
  studentId: string;
  managerId: string;
  vacancyId: string;
}

// ── Display label maps ──
// Kept outside components so they can be shared without re-importing component modules.

export const areaLabels: Record<string, string> = {
  IT: "Tecnologia da Informação",
  MAINTENANCE: "Manutenção",
  TOOLING: "Ferramentaria",
  CHEMISTRY: "Química",
};

export const shiftLabels: Record<string, string> = {
  FIRST: "Primeiro turno",
  SECOND: "Segundo turno",
  THIRD: "Terceiro turno",
  FLEXIBLE_SHIFT: "Turno flexível",
};

export const interviewStatusLabels: Record<string, string> = {
  NOT_ASSOCIATED: "Não associado",
  NOT_SEEN: "Convite não visualizado",
  DISCARDED: "Descartado",
  // SEEN means the candidate has viewed the invite and is available to interview.
  SEEN: "Disponível",
  DISAPPROVED: "Reprovado",
  HIRED: "Contratado",
};

// ── API functions ──
// IDs are always encodeURIComponent'd to handle UUIDs safely in path segments.

const vacancySeed: Vacancy[] = [];
const placeSeed: Place[] = [];
const studentSeed: Student[] = [];
const interviewSeed: Interview[] = [];
const managerSeed: Manager[] = [];
const coordinatorSeed: Coordinator[] = [];

export function getVacancies() {
  return apiFirst(
    () => apiFetchCollection<Vacancy>('/vacancy/find/all'),
    () => readCollection('manager-vacancies', vacancySeed)
  );
}

export interface VacancyRequirement {
  id: string;
  name: string;
  level: number;
  priority: boolean;
  type: 'TECHNICAL' | 'SOCIOEMOTIONAL';
}

export interface UserUpdateInput {
  name: string;
  email: string;
  username?: string;
  section?: ManagerSection;
}

export function getVacancy(id: string) {
  return apiFirst(
    () => apiFetch<Vacancy>(`/vacancy/find/id/${encodeURIComponent(id)}`),
    () => {
      const vacancy = readCollection('manager-vacancies', vacancySeed).find((item) => item.id === id);
      if (!vacancy) throw new Error('Vaga não encontrada.');
      return vacancy;
    }
  );
}

export function createVacancy(input: VacancyInput) {
  return apiFirst(
    () => apiFetch<Vacancy>('/vacancy/create', {
      method: 'POST',
      // The OpenAPI schema marks skillIds as optional, but the current service
      // expects a non-null collection and rejects an omitted field with 400.
      body: JSON.stringify({ ...input, skillIds: input.skillIds ?? [] }),
    }),
    () => {
      const places = readCollection('manager-places', placeSeed);
      const place = places.find((item) => item.id === input.placeId);
      const created: Vacancy = {
        id: createLocalId('vac'), name: input.name, description: input.description,
        numbersVacancies: input.numbersVacancies, area: input.area, shift: input.shift,
        park: place?.park ?? '', section: place?.section ?? '',
      };
      writeCollection('manager-vacancies', [...readCollection('manager-vacancies', vacancySeed), created]);
      return created;
    }
  );
}

export function updateVacancy(id: string, input: VacancyUpdateInput) {
  return apiFirst(
    () => apiFetch<Vacancy>(`/vacancy/update/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify(input),
    }),
    () => {
      const places = readCollection('manager-places', placeSeed);
      const place = places.find((item) => item.id === input.placeId);
      let updated: Vacancy | undefined;
      const next = readCollection('manager-vacancies', vacancySeed).map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...input, park: place?.park ?? item.park, section: place?.section ?? item.section };
        return updated;
      });
      if (!updated) throw new Error('Vaga não encontrada.');
      writeCollection('manager-vacancies', next);
      return updated;
    }
  );
}

export function deleteVacancy(id: string) {
  return apiFirst(
    () => apiFetch(`/vacancy/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => {
      const current = readCollection('manager-vacancies', vacancySeed);
      writeCollection('manager-vacancies', current.filter((item) => item.id !== id));
      return {};
    }
  );
}

export function getVacancyRequirements(vacancyId: string) {
  return Promise.resolve(
    readCollection<VacancyRequirement>(`vacancy-requirements-${vacancyId}`, [])
  );
}

export function saveVacancyRequirements(vacancyId: string, requirements: VacancyRequirement[]) {
  return Promise.resolve(
    writeCollection(`vacancy-requirements-${vacancyId}`, requirements)
  );
}

export function getStudents() {
  return apiFirst(
    () => apiFetchCollection<Student>('/student/find/all'),
    () => readCollection('manager-students', studentSeed)
  );
}

export function getStudent(id: string) {
  return apiFirst(
    () => apiFetch<Student>(`/student/find/id/${encodeURIComponent(id)}`),
    () => {
      const student = readCollection('manager-students', studentSeed).find((item) => item.id === id);
      if (!student) throw new Error('Aluno não encontrado.');
      return student;
    }
  );
}

// Only the interview status is patchable here — other student fields are managed
// through separate coordinator-facing endpoints not exposed in this module.
export function updateStudentInterviewStatus(
  id: string,
  statusStudentInterview: InterviewStatus
) {
  return apiFirst(
    () => apiFetch<Student>(`/student/update/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify({ statusStudentInterview }),
    }),
    () => {
      let updated: Student | undefined;
      const next = readCollection('manager-students', studentSeed).map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, statusStudentInterview };
        return updated;
      });
      if (!updated) throw new Error('Aluno não encontrado.');
      writeCollection('manager-students', next);
      return updated;
    }
  );
}

// studentName filter is applied server-side; no client-side filtering fallback.
export function getSkills(studentName?: string) {
  const endpoint = studentName
    ? `/skill/search?studentName=${encodeURIComponent(studentName)}`
    : '/skill/find/all';
  return apiFirst(
    () => apiFetchCollection<Skill>(endpoint),
    () => {
      const skills = readCollection<Skill>('manager-skills', []);
      return studentName ? skills.filter((item) => item.studentName === studentName) : skills;
    }
  );
}

export function getPlaces() {
  return apiFirst(
    () => apiFetchCollection<Place>('/place/find/all'),
    () => readCollection('manager-places', placeSeed)
  );
}

export function createPlace(input: PlaceInput) {
  return apiFirst(
    () => apiFetch<Place>('/place/create', { method: 'POST', body: JSON.stringify(input) }),
    () => {
      const created: Place = { id: createLocalId('plc'), ...input };
      writeCollection('manager-places', [...readCollection('manager-places', placeSeed), created]);
      return created;
    }
  );
}

export function updatePlace(id: string, input: PlaceInput) {
  return apiFirst(
    () => apiFetch<Place>(`/place/update/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify(input),
    }),
    () => {
      const updated: Place = { id, ...input };
      const next = readCollection('manager-places', placeSeed)
        .map((item) => item.id === id ? updated : item);
      writeCollection('manager-places', next);
      return updated;
    }
  );
}

export function deletePlace(id: string) {
  return apiFirst(
    () => apiFetch(`/place/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => {
      const current = readCollection('manager-places', placeSeed);
      writeCollection('manager-places', current.filter((item) => item.id !== id));
      return {};
    }
  );
}

export function getManagers() {
  return apiFirst(
    () => apiFetchCollection<Manager>('/manager/find/all'),
    () => readCollection('managers', managerSeed)
  );
}

export function getCoordinators() {
  return apiFirst(
    () => apiFetchCollection<Coordinator>('/coordinator/find/all'),
    () => readCollection('coordinators', coordinatorSeed)
  );
}

/**
 * Creates a manager account. The backend restricts this endpoint to ADMIN sessions.
 */
export function createManager(input: ManagerInput) {
  return apiFirst(
    () => apiFetch<Manager>('/manager/create', { method: 'POST', body: JSON.stringify(input) }),
    () => {
      const created: Manager = {
        id: createLocalId('mgr'), name: input.name, username: input.username,
        email: input.email, section: input.section,
      };
      writeCollection('managers', [...readCollection('managers', managerSeed), created]);
      return created;
    },
    { neverFallbackStatuses: [400, 401, 403, 404, 409, 422] }
  );
}

/**
 * Creates a coordinator account. The backend restricts this endpoint to ADMIN sessions.
 */
export function createCoordinator(input: CoordinatorInput) {
  return apiFirst(
    () => apiFetch<Coordinator>('/coordinator/create', { method: 'POST', body: JSON.stringify(input) }),
    () => {
      const created: Coordinator = {
        id: createLocalId('crd'), name: input.name,
        username: input.username, email: input.email,
      };
      writeCollection('coordinators', [...readCollection('coordinators', coordinatorSeed), created]);
      return created;
    },
    { neverFallbackStatuses: [400, 401, 403, 404, 409, 422] }
  );
}

export function updateManager(id: string, input: UserUpdateInput) {
  return apiFirst(
    () => apiFetch<Manager>(`/manager/update/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify({ name: input.name, section: input.section }),
    }),
    () => {
      let updated: Manager | undefined;
      const next = readCollection('managers', managerSeed).map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...input, section: input.section ?? item.section };
        return updated;
      });
      if (!updated) throw new Error('Gestor não encontrado.');
      writeCollection('managers', next);
      return updated;
    }
  );
}

export function deleteManager(id: string) {
  return apiFirst(
    () => apiFetch(`/manager/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => {
      writeCollection('managers', readCollection('managers', managerSeed).filter((item) => item.id !== id));
      return {};
    }
  );
}

export function updateCoordinator(id: string, input: UserUpdateInput) {
  return apiFirst(
    () => apiFetch<Coordinator>(`/coordinator/update/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify({ name: input.name }),
    }),
    () => {
      let updated: Coordinator | undefined;
      const next = readCollection('coordinators', coordinatorSeed).map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, name: input.name, email: input.email, username: input.username ?? item.username };
        return updated;
      });
      if (!updated) throw new Error('Coordenador não encontrado.');
      writeCollection('coordinators', next);
      return updated;
    }
  );
}

export function deleteCoordinator(id: string) {
  return apiFirst(
    () => apiFetch(`/coordinator/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    () => {
      writeCollection('coordinators', readCollection('coordinators', coordinatorSeed).filter((item) => item.id !== id));
      return {};
    }
  );
}

export function getInterviews() {
  return apiFirst(
    () => apiFetchCollection<Interview>('/interview/find/all'),
    () => readCollection('manager-interviews', interviewSeed)
  );
}

export function createInterview(input: InterviewInput) {
  return apiFirst(
    () => apiFetch<Interview>('/interview/create', { method: 'POST', body: JSON.stringify(input) }),
    () => {
      const student = readCollection('manager-students', studentSeed).find((item) => item.id === input.studentId);
      const place = readCollection('manager-places', placeSeed).find((item) => item.id === input.placeId);
      const created: Interview = {
        id: createLocalId('int'), interviewerName: input.interviewerName,
        dateTime: input.dateTime, park: place?.park ?? '', section: place?.section ?? '',
        nameStudent: student?.name ?? 'Aluno', nameManager: input.interviewerName,
        shift: new Date(input.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      writeCollection('manager-interviews', [...readCollection('manager-interviews', interviewSeed), created]);
      return created;
    }
  );
}

/**
 * Triggers the backend to send an invitation email for a scheduled interview.
 * Email is passed as a query param because the endpoint does not accept a body.
 */
export function sendInterviewEmail(interviewId: string, email: string) {
  return apiFirst(
    () => apiFetch<string>(
      `/manager/interview/sendEmail/${encodeURIComponent(interviewId)}?email=${encodeURIComponent(email)}`,
      { method: 'POST' }
    ),
    () => `Convite registrado para ${email}`
  );
}
