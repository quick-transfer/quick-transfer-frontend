import {
  apiFetch,
  buildPageQuery,
  pageContent,
  type PageQuery,
  type PageResponse,
} from "@/lib/api";
import type { UserRole } from "@/types";

export type EntityStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";
export type ClassStatus = "ON_GOING" | "FINISHED" | "NOT_STARTED";
export type ClassShift = "MORNING" | "AFTERNOON" | "NIGHT";
export type VacancyStatus = "OPEN" | "CLOSED" | "URGENT";

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Exclude<UserRole, "STUDENT">;
  active: boolean;
  firstLogin: boolean;
  section?: string;
}

export interface PlaceResponse {
  id: string;
  placeName: string;
  park: "WEG_I" | "WEG_II";
  section: string;
  code: string;
  description?: string;
  city?: string;
  state?: string;
  status: Exclude<EntityStatus, "COMPLETED">;
}

export interface PlacePayload {
  placeName: string;
  park: "WEG_I" | "WEG_II";
  section: string;
  code: string;
  description?: string;
  city?: string;
  state?: string;
  status: Exclude<EntityStatus, "COMPLETED">;
}

export interface CourseResponse {
  id: string;
  courseName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  code: string;
  status: EntityStatus;
  totalStudents: number;
}

export interface CoursePayload {
  name: string;
  coordinatorId: string;
  code: string;
  status: EntityStatus;
}

export interface ClassResponse {
  id: string;
  courseName: string;
  startDate: string;
  finishDate: string;
  status: ClassStatus;
  shiftClass: ClassShift;
  acronym: string;
  name: string;
  maxStudents: number;
  totalStudents: number;
}

export interface ClassPayload {
  courseId: string;
  startDate: string;
  finishDate: string;
  status: ClassStatus;
  shiftClass: ClassShift;
  acronym: string;
  name: string;
  maxStudents: number;
}

export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  age: number;
  averageGrade?: number;
  acronym: string;
  course: string;
  statusStudentInterview: string;
  hasSeenEmail: boolean;
  statusStudent: "ENROLLED" | "FIRED" | "LEFT";
  registration: string;
  attendanceRate: number;
  className: string;
  shift: ClassShift;
  performanceGrade?: number;
}

export interface StudentUpdatePayload {
  name?: string;
  email?: string;
  age?: number;
  averageGrade?: number;
  classId?: string;
  statusStudentInterview?: string;
  hasSeenEmail?: boolean;
  statusStudent?: "ENROLLED" | "FIRED" | "LEFT";
  registration?: string;
  attendanceRate?: number;
}

export interface VacancyResponse {
  id: string;
  name: string;
  description: string;
  numbersVacancies: number;
  area: string;
  shift: string;
  park: string;
  section: string;
  placeId: string;
  placeName: string;
  status: VacancyStatus;
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

export interface VacancyPayload {
  name: string;
  description: string;
  numbersVacancies: number;
  area: string;
  shift: string;
  placeId: string;
  skillIds?: string[];
  managerId?: string;
  status?: VacancyStatus;
}

async function all<T>(path: string, query: PageQuery = {}) {
  return pageContent(
    await apiFetch<PageResponse<T>>(`${path}${buildPageQuery(query)}`),
  );
}

export function getUsers(query: PageQuery = {}) {
  return all<UserResponse>("/user/find/all", query);
}

export function updateUser(id: string, input: { name?: string; active?: boolean }) {
  return apiFetch<UserResponse>(`/user/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/user/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getPlaces(query: PageQuery = {}) {
  return all<PlaceResponse>("/place/find/all", query);
}

export function createPlace(input: PlacePayload) {
  return apiFetch<PlaceResponse>("/place/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePlace(id: string, input: Partial<PlacePayload>) {
  return apiFetch<PlaceResponse>(`/place/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePlace(id: string) {
  return apiFetch<void>(`/place/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getCourses(query: PageQuery = {}) {
  return all<CourseResponse>("/course/find/all", query);
}

export function createCourse(input: CoursePayload) {
  return apiFetch<CourseResponse>("/course/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCourse(id: string, input: Partial<CoursePayload>) {
  return apiFetch<CourseResponse>(`/course/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCourse(id: string) {
  return apiFetch<void>(`/course/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getClasses(query: PageQuery = {}) {
  return all<ClassResponse>("/class/find/all", query);
}

export function createClass(input: ClassPayload) {
  return apiFetch<ClassResponse>("/class/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateClass(id: string, input: Partial<ClassPayload>) {
  return apiFetch<ClassResponse>(`/class/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteClass(id: string) {
  return apiFetch<void>(`/class/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getStudents(query: PageQuery = {}) {
  return all<StudentResponse>("/student/find/all", query);
}

export function getStudent(id: string) {
  return apiFetch<StudentResponse>(`/student/find/id/${encodeURIComponent(id)}`);
}

export function updateStudent(
  id: string,
  input: StudentUpdatePayload,
) {
  return apiFetch<StudentResponse>(`/student/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getVacancies(query: PageQuery = {}) {
  return all<VacancyResponse>("/vacancy/find/all", query);
}

export function getVacancy(id: string) {
  return apiFetch<VacancyResponse>(`/vacancy/find/id/${encodeURIComponent(id)}`);
}

export function createVacancy(input: VacancyPayload) {
  return apiFetch<VacancyResponse>("/vacancy/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateVacancy(id: string, input: Partial<VacancyPayload>) {
  return apiFetch<VacancyResponse>(`/vacancy/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteVacancy(id: string) {
  return apiFetch<void>(`/vacancy/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
