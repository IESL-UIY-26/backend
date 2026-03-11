export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
  contact_number?: string;
  gender?: string;
  address?: string;
  date_of_birth?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
