import { SessionLogResponseDTO, SessionParticipantResponseDTO, IWorkshopSessionResponseDTO } from "../../dtos/session.dtos";
import { ISessionLog, ISessionParticipant, IWorkshopSessionDocument } from "../../types/workshopSession.types";

export class WorkshopSessionMapper {

  private static mapParticipant(
    participant: ISessionParticipant
  ): SessionParticipantResponseDTO {
    return {
      foodieId: participant.foodieId.toString(),
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      isMuted: participant.isMuted
    };
  }


  private static mapLog(log: ISessionLog): SessionLogResponseDTO {
    return {
      type: log.type,
      userId: log.userId.toString(),
      timestamp: log.timestamp,
      metadata: log.metadata
    };
  }


  static toResponse(
    session: IWorkshopSessionDocument
  ): IWorkshopSessionResponseDTO {
    return {
      id: session.id.toString(),

      workshopId: session.workshopId.toString(),
      chefId: session.chefId.toString(),
      roomId: session.roomId,

      isLive: session.isLive,
      startedAt: session.startedAt,
      endedAt: session.endedAt,

      participants: session.participants.map(this.mapParticipant),
      logs: session.logs.map(this.mapLog),

      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }

}