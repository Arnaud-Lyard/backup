export interface ITestimonial {
  id: number;
  description: string;
  rating: number;
  isActive: boolean;
  owner: {
    firstname: string;
  };
}
