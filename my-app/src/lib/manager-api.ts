import { apiFetch } from "@/lib/api";

export type VacancyArea = "IT" | "MAINTENANCE" | "TOOLING" | "CHEMISTRY";
export type VacancyShift = "FIRST" | "SECOND" | "THIRD" | "FLEXIBLE_SHIFT";
export type InterviewStatus =
  | "NOT_ASSOCIATED"
  | "NOT_SEEN"
  | "DISCARDED"
  | "SEEN"
  | "DISAPPROVED"
  | "HIRED";

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
  placeId: string;
}

export interface VacancyUpdateInput {
  name: string;
  description: string;
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
  dateTime: string;
  placeId: string;
  studentId: string;
  managerId: string;
  vacancyId: string;
}

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
  SEEN: "Disponível",
  DISAPPROVED: "Reprovado",
  HIRED: "Contratado",
};

export function getVacancies() {
  return apiFetch<Vacancy[]>("/vacancy/find/all");
}

export function getVacancy(id: string) {
  return apiFetch<Vacancy>(`/vacancy/find/id/${encodeURIComponent(id)}`);
}

export function createVacancy(input: VacancyInput) {
  return apiFetch<Vacancy>("/vacancy/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateVacancy(id: string, input: VacancyUpdateInput) {
  return apiFetch<Vacancy>(`/vacancy/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteVacancy(id: string) {
  return apiFetch(`/vacancy/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getStudents() {
  return apiFetch<Student[]>("/student/find/all");
}

export function getStudent(id: string) {
  return apiFetch<Student>(`/student/find/id/${encodeURIComponent(id)}`);
}

export function updateStudentInterviewStatus(
  id: string,
  statusStudentInterview: InterviewStatus
) {
  return apiFetch<Student>(`/student/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ statusStudentInterview }),
  });
}

export function getSkills(studentName?: string) {
  if (!studentName) return apiFetch<Skill[]>("/skill/find/all");
  return apiFetch<Skill[]>(
    `/skill/search?studentName=${encodeURIComponent(studentName)}`
  );
}

export function getPlaces() {
  return apiFetch<Place[]>("/place/find/all");
}

export function createPlace(input: PlaceInput) {
  return apiFetch<Place>("/place/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePlace(id: string, input: PlaceInput) {
  return apiFetch<Place>(`/place/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePlace(id: string) {
  return apiFetch(`/place/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getManagers() {
  return apiFetch<Manager[]>("/manager/find/all");
}

/**
 * Cria um gestor. O backend protege esta rota para sessões com perfil ADMIN.
 */
export function createManager(input: ManagerInput) {
  return apiFetch<Manager>("/manager/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Cria um coordenador. O backend protege esta rota para sessões com perfil ADMIN.
 */
export function createCoordinator(input: CoordinatorInput) {
  return apiFetch<Coordinator>("/coordinator/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getInterviews() {
  return apiFetch<Interview[]>("/interview/find/all");
}

export function createInterview(input: InterviewInput) {
  return apiFetch<Interview>("/interview/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sendInterviewEmail(interviewId: string, email: string) {
  return apiFetch<string>(
    `/manager/interview/sendEmail/${encodeURIComponent(interviewId)}?email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );
}
