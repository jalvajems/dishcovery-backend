export interface IPaginationDto {
  page: number;
  limit: number;
  search: string;
  isBlocked?: string; 
  isVerified?:string
}
