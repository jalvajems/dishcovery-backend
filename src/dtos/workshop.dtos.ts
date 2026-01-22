import { WorkshopMode, WorkshopStatus } from "../types/workshop.types";

export interface IWorkshopResponseDTO {
  id: string;

  title: string;
  description: string;
  category: string;
  tags: string[];

  chefId: string;

  date: Date;
  startTime: string;
  duration: number;
  participantLimit: number;
  participantsCount: number;

  mode: WorkshopMode;
  isFree: boolean;
  price: number;

  location?: {
    venueName?: string;
    address?: string;
    city?: string;
  };

  isLive?: boolean;
  status: WorkshopStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
