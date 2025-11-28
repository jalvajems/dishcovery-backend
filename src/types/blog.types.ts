export interface IBlog {
  chefId: string;

  title: string;
  shortDescription: string;
  content: string;

  coverImage?: string;
  tags?: string[];

  isDraft: boolean;
  status: "active" | "blocked";

  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
