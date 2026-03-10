export interface SessionParticipantResponseDTO {
  foodieId: string;
  joinedAt: Date;
  leftAt?: Date;
  isMuted: boolean;
}
export interface SessionLogResponseDTO {
  type: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}



export interface IWorkshopSessionResponseDTO {
  id: string;

  workshopId: string;
  chefId: string;
  roomId: string;

  isLive: boolean;
  startedAt: Date;
  endedAt?: Date;

  participants: SessionParticipantResponseDTO[];
  logs: SessionLogResponseDTO[];

  createdAt: Date;
  updatedAt: Date;
}