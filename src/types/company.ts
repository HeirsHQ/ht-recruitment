export interface Company {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  company: Company;
}
