export interface Error {
  status: number;
  message: string;
  violations?: Violation[];
}

export interface Violation {
  property: string;
  message: string;
}
