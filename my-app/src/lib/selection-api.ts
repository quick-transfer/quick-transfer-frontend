import {
  apiFetch,
  buildPageQuery,
  pageContent,
  type PageQuery,
  type PageResponse,
} from "@/lib/api";
import type { UserRole } from "@/types";

export type ApplicationStatus =
  | "REFERRED"
  | "INTERVIEW_SCHEDULED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface VacancyApplicationResponse {
  id: string;
  vacancyId: string;
  vacancyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registration: string;
  coordinatorId: string;
  coordinatorName: string;
  managerId?: string;
  managerName?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interviewId?: string;
}

export interface InterviewResponse {
  id: string;
  interviewerName: string;
  dateTime: string;
  park: string;
  section: string;
  nameStudent: string;
  nameManager: string;
  shift: string;
  studentId: string;
  studentEmail: string;
  vacancyId: string;
  vacancyName: string;
  placeId: string;
  placeName: string;
  managerId: string;
  notes?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  outcome: "PENDING" | "APPROVED" | "REJECTED";
  applicationId?: string;
}

export interface InterviewPayload {
  interviewerName: string;
  dateTime: string;
  studentId: string;
  vacancyId: string;
  placeId?: string;
  managerId?: string;
  notes?: string;
  applicationId?: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  username: string;
  role: Exclude<UserRole, "STUDENT">;
}

export async function getApplications(query: PageQuery = {}) {
  return pageContent(
    await apiFetch<PageResponse<VacancyApplicationResponse>>(
      `/application/find/all${buildPageQuery(query)}`,
    ),
  );
}

export function createApplication(input: {
  vacancyId: string;
  studentId: string;
  notes?: string;
}) {
  return apiFetch<VacancyApplicationResponse>("/application/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateApplication(
  id: string,
  input: { status?: ApplicationStatus; notes?: string },
) {
  return apiFetch<VacancyApplicationResponse>(
    `/application/update/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function getInterviews(query: PageQuery = {}) {
  return pageContent(
    await apiFetch<PageResponse<InterviewResponse>>(
      `/interview/find/all${buildPageQuery(query)}`,
    ),
  );
}

export function createInterview(input: InterviewPayload) {
  return apiFetch<InterviewResponse>("/interview/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateInterview(
  id: string,
  input: Partial<InterviewPayload> & {
    status?: InterviewResponse["status"];
    outcome?: InterviewResponse["outcome"];
  },
) {
  return apiFetch<InterviewResponse>(`/interview/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteInterview(id: string) {
  return apiFetch<void>(`/interview/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function sendInterviewEmail(id: string) {
  return apiFetch<{ message: string }>(
    `/manager/interview/sendEmail/${encodeURIComponent(id)}`,
    { method: "POST" },
  );
}

export function getCurrentUser() {
  return apiFetch<AuthenticatedUser>("/auth/me");
}
