export type UserRole = 'ADMIN' | 'BARBER' | 'CUSTOMER';
export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  barbershop_id?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  barbershop_id?: string;
  created_at: string;
}

export interface BarberSchedule {
  id?: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
}

export interface Appointment {
  id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  barbershop_id?: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  created_at: string;
}

