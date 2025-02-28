export interface IPendingCompanies {
  id: number;
  name: string;
  description: string;
  address: string;
  logo: string;
  owner: {
    email: string;
  };
}

export interface ICompany {
  id: string;
  name: string;
  description: string;
  address: string;
  logo: string;
}
