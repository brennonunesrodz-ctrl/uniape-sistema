export type UserRole = 'presidente' | 'secretaria';
export type SecretariaType = 'UNIAPE' | 'UniUp' | 'UniE' | 'UniScience';

export type Page =
  | 'dashboard'
  | 'members'
  | 'events'
  | 'frequency'
  | 'certificates'
  | 'profile'
  | 'secretaries'
  | 'files';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  secretariaType?: SecretariaType;
  signatureUrl?: string;
  active: boolean;
}

export interface Member {
  id: string;
  name: string;
  active: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  hours: number;
  semester: string;
  createdBy: string;
  qrCode: string;
}

export interface Attendance {
  id: string;
  eventId: string;
  memberId: string;
  timestamp: string;
}

export interface MemberFrequency {
  member: Member;
  presences: number;
  total: number;
  percentage: number;
  hours: number;
  eligible: boolean;
}

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface FileItem {
  id: string;
  folderId: string;
  name: string;
  type: 'image' | 'document' | 'note' | 'link';
  content: string;
  mimeType?: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
}
