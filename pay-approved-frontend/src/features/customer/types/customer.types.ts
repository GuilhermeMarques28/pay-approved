export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  locationLat: number | null;
  locationLng: number | null;
  createdAt: string;
}

export interface CustomerRegistrationData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
