import {
  apiFetch,
  buildPageQuery,
  pageContent,
  type PageQuery,
  type PageResponse,
} from "@/lib/api";

export interface OperationalShiftResponse {
  id: string;
  name: string;
  code: string;
  supervisorName?: string;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  status: "NORMAL" | "HIGH_DEMAND" | "FULL";
  active: boolean;
}

export interface TransferRequestResponse {
  id: string;
  studentId: string;
  studentName: string;
  registration: string;
  currentShiftId: string;
  currentShift: string;
  targetShiftId: string;
  targetShift: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  requestedById: string;
  requestedByName: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
}

export interface StudentTimelineResponse {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  type: "TRANSFER" | "INTERVIEW" | "WARNING" | "INFO";
  status: "success" | "info" | "warning" | "danger" | "neutral";
}

export interface SystemSettingsResponse {
  defaultShiftCapacity: number;
  highDemandPercentage: number;
  emailSender: string;
  updatedAt: string;
  updatedByName?: string;
}

export function getOperationalShifts() {
  return apiFetch<OperationalShiftResponse[]>("/shift/find/all");
}

export function updateOperationalShift(
  id: string,
  input: Partial<Pick<OperationalShiftResponse, "name" | "supervisorName" | "capacity" | "active">>,
) {
  return apiFetch<OperationalShiftResponse>(`/shift/update/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function assignStudentShift(
  studentId: string,
  input: { targetShiftId: string; reason?: string },
) {
  return apiFetch<TransferRequestResponse>(
    `/shift/student/${encodeURIComponent(studentId)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function getTransferRequests(
  query: PageQuery & { status?: TransferRequestResponse["status"] } = {},
) {
  const { status, ...pageQuery } = query;
  const base = `/transfer-request/find/all${buildPageQuery(pageQuery)}`;
  const separator = base.includes("?") ? "&" : "?";
  const path = status ? `${base}${separator}status=${encodeURIComponent(status)}` : base;
  return pageContent(await apiFetch<PageResponse<TransferRequestResponse>>(path));
}

export function createTransferRequest(input: {
  studentId: string;
  targetShiftId: string;
  reason: string;
}) {
  return apiFetch<TransferRequestResponse>("/transfer-request/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resolveTransferRequest(
  id: string,
  input: { status: "APPROVED" | "REJECTED"; resolutionNotes?: string },
) {
  return apiFetch<TransferRequestResponse>(
    `/transfer-request/resolve/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function getStudentTimeline(studentId: string) {
  return apiFetch<StudentTimelineResponse[]>(
    `/student/find/id/${encodeURIComponent(studentId)}/timeline`,
  );
}

export function getSystemSettings() {
  return apiFetch<SystemSettingsResponse>("/settings");
}

export function updateSystemSettings(input: {
  defaultShiftCapacity?: number;
  highDemandPercentage?: number;
  emailSender?: string;
}) {
  return apiFetch<SystemSettingsResponse>("/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
