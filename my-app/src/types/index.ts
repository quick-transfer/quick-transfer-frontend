// Types reflecting the Quick Transfer backend API schemas
// Repository: https://github.com/quick-transfer/quick-transfer-backend (branch: develop)

export type UserRole = "ADMIN" | "COORDINATOR" | "MANAGER" | "STUDENT";

export type StatusType = "success" | "danger" | "warning" | "info" | "neutral";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
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
  status: "SCHEDULED" | "APPROVED" | "REJECTED" | "PENDING";
}

export interface StudentDTO {
  id: string;
  name: string;
  registration: string;
  email: string;
  courseName: string;
  className: string;
  shift: string;
  status: "ACTIVE" | "TRANSFERRING" | "COMPLETED" | "PAUSED";
  attendanceRate: number;
  performanceGrade: number;
  avatarUrl?: string;
}

export interface ShiftDTO {
  id: string;
  name: string;
  code: string;
  supervisorName: string;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  status: "NORMAL" | "HIGH_DEMAND" | "FULL";
}

export interface NotificationTimelineDTO {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  type: "TRANSFER" | "INTERVIEW" | "WARNING" | "INFO";
  status: StatusType;
}

export interface TransferRequestDTO {
  id: string;
  studentName: string;
  currentShift: string;
  targetShift: string;
  reason: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}
