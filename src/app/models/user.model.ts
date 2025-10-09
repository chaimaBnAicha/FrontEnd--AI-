export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adresse: string;
}

export interface Role {
  id: number;
  name: string;
}