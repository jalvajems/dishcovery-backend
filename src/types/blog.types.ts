export interface IBlog {
  chefId: string;

  title: string;
  shortDescription: string;
  content: string;

  coverImage?: string;
  tags?: string[];

  isDraft: boolean;
  isBlocked:boolean;
  status: "active" | "blocked";

  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
