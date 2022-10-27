export interface CreateFile {
  id: string;
  userId: string;
  organizationId?: string;
  location: string;
  originalName: string;
  thumbnail?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}
