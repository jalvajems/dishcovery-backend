import { injectable, inject } from 'inversify';
import TYPES from '../../DI/types';
import { IWorkshopSessionService } from '../interface/IWorkshopSessionService';
import { IWorkshopSessionRepository } from '../../repostories/interface/IWorkshopSessionRepository';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IBookingRepository } from '../../repostories/interface/IBookingRepository';
import { IWorkshopSessionDocument, SessionEvent } from '../../types/workshopSession.types';
import { WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { BookingStatus } from '../../types/booking.types';
import { AppError } from '../../utils/AppError';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { WorkshopSessionMapper } from '../../utils/mapper/session.mapper';
import { IWorkshopSessionResponseDTO } from '../../dtos/session.dtos';

@injectable()
export class WorkshopSessionService implements IWorkshopSessionService {
    constructor(
        @inject(TYPES.WorkshopSessionRepository) private sessionRepository: IWorkshopSessionRepository,
        @inject(TYPES.IWorkshopRepository) private workshopRepository: IWorkshopRepository,
        @inject(TYPES.IBookingRepository) private bookingRepository: IBookingRepository
    ) { }

    async startSession(workshopId: string, chefId: string): Promise<IWorkshopSessionResponseDTO> {
        console.log('session service1');

        const workshop = await this.workshopRepository.findById(workshopId);

        if (!workshop) throw new AppError('Workshop not found', 404);
        if (workshop.chefId.toString() !== chefId) throw new AppError('Unauthorized', 403);
        if (workshop.mode !== WorkshopMode.ONLINE) throw new AppError('Only online workshops can have live sessions', 400);

        if (workshop.status !== WorkshopStatus.APPROVED && workshop.status !== WorkshopStatus.UPCOMING) {
            throw new AppError(`Cannot start session from status: ${workshop.status}`, 400);
        }

        const existingSession = await this.sessionRepository.findByWorkshopId(workshopId);
        if (existingSession) return WorkshopSessionMapper.toResponse(existingSession);

        const roomId = uuidv4();
        const session = await this.sessionRepository.create({
            workshopId: new Types.ObjectId(workshopId),
            chefId: new Types.ObjectId(chefId),
            roomId,
            isLive: true,
            startedAt: new Date(),
            participants: [],
            logs: [{
                type: SessionEvent.JOIN,
                userId: new Types.ObjectId(chefId),
                timestamp: new Date(),
                metadata: { role: 'HOST' }
            }]
        });

        await this.workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.LIVE,
            sessionRoomId: roomId
        });

        return WorkshopSessionMapper.toResponse(session);
    }

    async endSession(workshopId: string, chefId: string): Promise<void> {
        console.log('reached end sesion workshop');

        const workshop = await this.workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', 404);
        if (workshop.chefId.toString() !== chefId) throw new AppError('Unauthorized', 403);

        const session = await this.sessionRepository.findByWorkshopId(workshopId);
        if (!session) throw new AppError('No active session found', 404);

        await this.sessionRepository.endSession(session._id as string);
        await this.sessionRepository.addLog(session._id as string, {
            type: SessionEvent.LEAVE,
            userId: new Types.ObjectId(chefId),
            timestamp: new Date(),
            metadata: { reason: 'HOST_END_SESSION' }
        });

        await this.workshopRepository.updateById(workshopId, { status: WorkshopStatus.COMPLETED });
    }

    async joinSession(workshopId: string, foodieId: string): Promise<{ session: IWorkshopSessionResponseDTO, role: string }> {
        const workshop = await this.workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', 404);
        if (workshop.status !== WorkshopStatus.LIVE) throw new AppError('Workshop is not live', 400);

        const booking = await this.bookingRepository.findByWorkshopAndFoodie(workshopId, foodieId);
        if (!booking || booking.status !== BookingStatus.CONFIRMED) {
            throw new AppError('You must have a confirmed booking to join this workshop', 403);
        }

        const session = await this.sessionRepository.findByWorkshopId(workshopId);
        if (!session) throw new AppError('No active session found', 404);

        const alreadyJoined = session.participants.find(p => p.foodieId.toString() === foodieId && !p.leftAt);
        if (!alreadyJoined) {
            await this.sessionRepository.addParticipant(session._id as string, {
                foodieId: new Types.ObjectId(foodieId),
                joinedAt: new Date(),
                isMuted: false
            });
            await this.sessionRepository.addLog(session._id as string, {
                type: SessionEvent.JOIN,
                userId: new Types.ObjectId(foodieId),
                timestamp: new Date()
            });
        }

        return { session: WorkshopSessionMapper.toResponse(session), role: 'PARTICIPANT' };
    }

    async leaveSession(workshopId: string, foodieId: string): Promise<void> {
        const session = await this.sessionRepository.findByWorkshopId(workshopId);
        if (!session) throw new AppError('No active session found', 404);

        await this.sessionRepository.removeParticipant(session._id as string, foodieId);
        await this.sessionRepository.addLog(session._id as string, {
            type: SessionEvent.LEAVE,
            userId: new Types.ObjectId(foodieId),
            timestamp: new Date()
        });
    }

    async getSessionInfo(workshopId: string): Promise<IWorkshopSessionResponseDTO | null> {
        const session = await this.sessionRepository.findByWorkshopId(workshopId);
        return session ? WorkshopSessionMapper.toResponse(session) : null;
    }

    async getActiveSessions(): Promise<IWorkshopSessionResponseDTO[]> {
        const sessions = await this.sessionRepository.findAll({ isLive: true });
        return sessions.map(session => WorkshopSessionMapper.toResponse(session));
    }
}
