export interface IBlogDto{
      chefId: string|object;
_id:string;
  title: string;
  shortDescription: string;
  content: string;

  coverImage?: string;
  tags?: string[];

  isDraft: boolean;
  isBlocked:boolean
  status: "active" | "blocked";

  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;

}