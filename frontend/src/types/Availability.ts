export type Availability = Record<string, ITime[]>;

export interface ITime {
  id: number;
  start?: string;
  end?: string;
  closed?: boolean;
}

export type ClosedDays = Record<string, boolean>;
