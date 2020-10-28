export interface KeyValuePair {
  [key: string]: any;
}

export class PaginationResponse {
  totalItems: number;
  hasMore: boolean;
}
