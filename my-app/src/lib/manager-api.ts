import {
  apiFetch,
  buildPageQuery,
  pageContent,
  type PageQuery,
  type PageResponse,
} from "@/lib/api";

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
  placeName: string;
  status: "OPEN" | "CLOSED" | "URGENT";
  managerId?: string;
  managerName?: string;
  filledSpots: number;
  skills: Array<{
    id: string;
    name: string;
    skillType: string;
    minimumGrade: number;
  }>;
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
  status?: "OPEN" | "CLOSED" | "URGENT";
}

// Update omits numbersVacancies intentionally: spot count changes go through
// a separate backend workflow to maintain audit integrity.
export interface VacancyUpdateInput {
  name: string;
  description: string;
  area: VacancyArea;
  shift: VacancyShift;
  placeId: string;
  numbersVacancies?: number;
  skillIds?: string[];
  status?: "OPEN" | "CLOSED" | "URGENT";
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
  registration: string;
  attendanceRate: number;
  className: string;
  shift: "MORNING" | "AFTERNOON" | "NIGHT" | string;
  performanceGrade?: number;
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
  code: string;
  description?: string;
  city?: string;
  state?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface PlaceInput {
  placeName: string;
  // Only two parks currently supported by the backend.
  park: "WEG_I" | "WEG_II";
  section: string;
  code?: string;
  description?: string;
  city?: string;
  state?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface Manager {
  id: string;
  name: string;
  username: string;
  email: string;
  section: string;
  role: "MANAGER";
  active: boolean;
  firstLogin: boolean;
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
  role: "COORDINATOR";
  active: boolean;
  firstLogin: boolean;
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

export function getVacanciesPage(query: PageQuery = {}) {
  return apiFetch<PageResponse<Vacancy>>(
    `/vacancy/find/all${buildPageQuery(query)}`
  );
}

export async function getVacancies(query: PageQuery = {}) {
  return pageContent(await getVacanciesPage(query));
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

export function getStudentsPage(query: PageQuery = {}) {
  return apiFetch<PageResponse<Student>>(
    `/student/find/all${buildPageQuery(query)}`
  );
}

export async function getStudents(query: PageQuery = {}) {
  return pageContent(await getStudentsPage(query));
}

export function getStudent(id: string) {
  return apiFetch<Student>(`/student/find/id/${encodeURIComponent(id)}`);
}

// Only the interview status is patchable here — other student fields are managed
// through separate coordinator-facing endpoints not exposed in this module.
export function updateStudentInterviewStatus(
  id: string,
  statusStudentInterview: InterviewStatus
) {
  return apiFetch<Student>(`/student/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ statusStudentInterview }),
  });
}

// studentName filter is applied server-side; no client-side filtering fallback.
export async function getSkills(studentName?: string) {
  const response = !studentName
    ? await apiFetch<PageResponse<Skill>>("/skill/find/all")
    : await apiFetch<PageResponse<Skill>>(
        `/skill/search?studentName=${encodeURIComponent(studentName)}`
      );
  return pageContent(response);
}

export function getPlacesPage(query: PageQuery = {}) {
  return apiFetch<PageResponse<Place>>(
    `/place/find/all${buildPageQuery(query)}`
  );
}

export async function getPlaces(query: PageQuery = {}) {
  return pageContent(await getPlacesPage(query));
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

export function getManagersPage(query: PageQuery = {}) {
  return apiFetch<PageResponse<Manager>>(
    `/manager/find/all${buildPageQuery(query)}`
  );
}

export async function getManagers(query: PageQuery = {}) {
  return pageContent(await getManagersPage(query));
}

/**
 * Creates a manager account. The backend restricts this endpoint to ADMIN sessions.
 */
export function createManager(input: ManagerInput) {
  return apiFetch<Manager>("/manager/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Creates a coordinator account. The backend restricts this endpoint to ADMIN sessions.
 */
export function createCoordinator(input: CoordinatorInput) {
  return apiFetch<Coordinator>("/coordinator/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getInterviewsPage(query: PageQuery = {}) {
  return apiFetch<PageResponse<Interview>>(
    `/interview/find/all${buildPageQuery(query)}`
  );
}

export async function getInterviews(query: PageQuery = {}) {
  return pageContent(await getInterviewsPage(query));
}

export function createInterview(input: InterviewInput) {
  return apiFetch<Interview>("/interview/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Triggers the backend to send an invitation email for a scheduled interview.
 * The backend resolves the recipient from the interview and authenticated manager.
 */
export function sendInterviewEmail(interviewId: string) {
  return apiFetch<string>(
    `/manager/interview/sendEmail/${encodeURIComponent(interviewId)}`,
    { method: "POST" }
  );
}
