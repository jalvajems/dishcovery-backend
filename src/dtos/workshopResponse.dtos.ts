import { WorkshopMode, WorkshopType, WorkshopStatus } from "../models/workshop.model";

export interface IWorkshopResponseDTO {
  _id: string;

  chefId: string;

  title: string;
  description: string;
  category: string;

  startDateTime: Date;
  durationInMinutes: number;

  participantLimit: number;
  totalBookings: number;

  mode: WorkshopMode;

  location?: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };

  type: WorkshopType;
  price: number;
  currency: string;

  status: WorkshopStatus;

  isSessionActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
