export type UserRole = 'ADMIN' | 'BARBER' | 'CUSTOMER';
export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

