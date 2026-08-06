// Types reflecting the Quick Transfer backend API schemas
// Repository: https://github.com/quick-transfer/quick-transfer-backend (branch: develop)

// Perfis que autenticam e operam o sistema. Aluno é uma entidade de domínio
// representada por StudentDTO, não um usuário com acesso à aplicação.
export type UserRole = "ADMIN" | "COORDINATOR" | "MANAGER";

export type StatusType = "success" | "danger" | "warning" | "info" | "neutral";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  // Lowercase strings here, not UserRole — the sidebar normalizes them before comparing.
  roles: ("admin" | "coordinator")[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Domain DTOs ──

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string;
  active: boolean;
  avatarUrl?: string;
}

export interface PlaceDTO {
  id: string;
  name: string;
  code: string;
  description?: string;
  city: string;
  state: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CourseDTO {
  id: string;
  name: string;
  code: string;
  coordinatorName: string;
  totalStudents: number;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
}

export interface ClassDTO {
  id: string;
  name: string;
  code: string;
  courseName: string;
  period: string;
  totalStudents: number;
  maxStudents: number;
  status: "IN_PROGRESS" | "PLANNED" | "COMPLETED";
}

// VacancyDTO is the coordinator-facing view of a vacancy (dashboard summary).
// The manager-facing full model lives in lib/manager-api.ts as Vacancy.
export interface VacancyDTO {
  id: string;
  title: string;
  department: string;
  location: string;
  totalSpots: number;
  filledSpots: number;
  status: "OPEN" | "CLOSED" | "URGENT";
}

export interface InterviewDTO {
  id: string;
  candidateName: string;
  candidateEmail: string;
  vacancyTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  interviewerName: string;
  // APPROVED and REJECTED are terminal states; PENDING is the only actionable one.
  status: "SCHEDULED" | "APPROVED" | "REJECTED" | "PENDING";
}

export interface StudentDTO {
  id: string;
  name: string;
  registration: string;
  email: string;
  courseName: string;
  className: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  attendanceRate?: number;
  performanceGrade?: number;
  avatarUrl?: string;
}

export interface NotificationTimelineDTO {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  type: "INTERVIEW" | "WARNING" | "INFO";
  status: StatusType;
}
