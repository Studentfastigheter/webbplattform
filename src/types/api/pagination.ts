export interface PageResponse<T> {
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  content: T[];
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
