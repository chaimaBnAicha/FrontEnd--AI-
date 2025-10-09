export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adresse: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}