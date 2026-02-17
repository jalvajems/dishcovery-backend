import { inject, injectable } from 'inversify';
import TYPES from '../../DI/types';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IWorkshopService } from '../interface/IWorkshopService';
import { IWorkshopDocument, WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { AppError } from '../../utils/AppError';
import { STATUS_CODE } from '../../constants/StatusCode';
import { IWorkshopSessionService } from '../interface/IWorkshopSessionService';
import { IWorkshopResponseDTO } from '../../dtos/workshop.dtos';
import { IWorkshopSessionResponseDTO } from '../../dtos/session.dtos';
import { workshopMapper } from '../../utils/mapper/workshop.mapper';
import { WorkshopSessionMapper } from '../../utils/mapper/session.mapper';
import { IBookingService } from '../interface/IBookingService';

import { INotificationService } from '../interface/INotificationService';
import { Role } from "../../types/user.types";

@injectable()
export class WorkshopService implements IWorkshopService {
    constructor(
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository,
        @inject(TYPES.WorkshopSessionService) private _sessionService: IWorkshopSessionService,
        @inject(TYPES.IBookingService) private _bookingService: IBookingService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService
    ) { }

    async createWorkshop(chefId: string, data: any): Promise<IWorkshopDocument> {
        const workshopData = {
            ...data,
            chefId,
            status: WorkshopStatus.DRAFT,
        };
        return await this._workshopRepository.create(workshopData);
    }

    async updateWorkshop(workshopId: string, chefId: string, data: any): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) {
            throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);
        }

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized: You are not the owner of this workshop', STATUS_CODE.FORBIDDEN);
        }

        if (workshop.status !== WorkshopStatus.DRAFT && workshop.status !== WorkshopStatus.PENDING_APPROVAL) {
            throw new AppError('Cannot edit workshop after approval', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, data);
        if (!updated) throw new AppError('Failed to update workshop', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async getWorkshopById(id: string, userId?: string): Promise<IWorkshopDocument | null> {
        const workshop = await this._workshopRepository.findWithChef(id);
        if (!workshop) return null;

        if (userId) {
            const bookings = await this._bookingService.getMyBookings(userId);
            console.log('getWorkshopById service - userId:', userId, 'bookings count:', bookings.length);

            const myBooking = bookings.find(b => {
                const match = b.workshopId.toString() === (workshop._id as any).toString();
                console.log(`Checking booking ${b._id}: workshopId ${b.workshopId} vs target ${(workshop._id as any)} -> match? ${match}`);
                return match;
            });
            console.log('getWorkshopById service - found myBooking:', myBooking ? myBooking._id : 'null');

            const isBooked = !!myBooking;
            const workshopObj = workshop.toObject ? workshop.toObject() : workshop;
            return { ...workshopObj, isBooked, myBooking } as any;
        }

        return workshop;
    }

    async getChefWorkshops(chefId: string): Promise<IWorkshopDocument[]> {
        return await this._workshopRepository.findAll({ chefId });
    }

    async getAllWorkshopsForAdmin(): Promise<IWorkshopDocument[]> {
        return await this._workshopRepository.findAll({});
    }

    async getApprovedWorkshops(page: number, limit: number, search: string, filter?: string, userId?: string): Promise<{ datas: IWorkshopDocument[], totalCount: number }> {
        const skip = (page - 1) * limit;
        const result = await this._workshopRepository.findAllApprovedWithFilters(skip, limit, search, filter);

        if (userId) {
            const bookings = await this._bookingService.getMyBookings(userId);
            const bookedWorkshopIds = new Set(
                bookings
                    .filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
                    .map(b => b.workshopId.toString())
            );

            const workshopsWithStatus = result.datas.map(w => {
                const wObj = w.toObject ? w.toObject() : w;
                return { ...wObj, isBooked: bookedWorkshopIds.has((w._id as any).toString()) };
            });

            return { datas: workshopsWithStatus as any[], totalCount: result.totalCount };
        }

        return result;
    }

    async approveWorkshop(workshopId: string, adminId: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.status !== WorkshopStatus.PENDING_APPROVAL) {
            throw new AppError('Workshop is not in pending status', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: adminId
        });

        if (!updated) throw new AppError('Failed to approve workshop', STATUS_CODE.INTERNAL_SERVER_ERROR);

        await this._notificationService.createNotification(
            (workshop.chefId as any).toString(),
            Role.CHEF,
            'Workshop Approved',
            `Your workshop "${workshop.title}" has been approved.`,
            'WORKSHOP_APPROVED',
            workshopId
        );

        return updated;
    }

    async rejectWorkshop(workshopId: string, adminId: string, reason: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.status !== WorkshopStatus.PENDING_APPROVAL) {
            throw new AppError('Workshop is not in pending status', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.REJECTED,
            rejectionReason: reason
        });

        if (!updated) throw new AppError('Failed to reject workshop', STATUS_CODE.INTERNAL_SERVER_ERROR);

        await this._notificationService.createNotification(
            (workshop.chefId as any).toString(),
            Role.CHEF,
            'Workshop Rejected',
            `Your workshop "${workshop.title}" has been rejected. Reason: ${reason}`,
            'WORKSHOP_REJECTED',
            workshopId
        );

        return updated;
    }

    async submitForApproval(workshopId: string, chefId: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN);
        }

        if (workshop.status !== WorkshopStatus.DRAFT && workshop.status !== WorkshopStatus.REJECTED) {
            throw new AppError('Workshop cannot be submitted for approval in current status', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.PENDING_APPROVAL
        });

        if (!updated) throw new AppError('Failed to submit for approval', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async startSession(workshopId: string, chefId: string): Promise<{ workshop: IWorkshopResponseDTO, session: IWorkshopSessionResponseDTO }> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);
        console.log('rech start sesion wsrvs');

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN);
        }
        console.log('rech start sesion wsrvs2');

        if (workshop.status !== WorkshopStatus.APPROVED && workshop.status !== WorkshopStatus.UPCOMING) {
            throw new AppError('Workshop cannot be started', STATUS_CODE.BAD_REQUEST);
        }
        console.log('rech start sesion wsrvs3');

        if (workshop.mode !== WorkshopMode.ONLINE) {
            throw new AppError('Only online workshops can be started', STATUS_CODE.BAD_REQUEST);
        }

        const workshopDate = new Date(workshop.date);
        const [hours, minutes] = workshop.startTime.split(':').map(Number);
        workshopDate.setHours(hours, minutes, 0, 0);

        if (new Date() < workshopDate) {
            throw new AppError('Workshop cannot be started before scheduled time', STATUS_CODE.BAD_REQUEST);
        }

        const oneHourAfterStart = new Date(workshopDate.getTime() + 60 * 60 * 1000);
        if (new Date() > oneHourAfterStart) {
            throw new AppError('Workshop session has expired and cannot be started', STATUS_CODE.BAD_REQUEST);
        }

        const session = await this._sessionService.startSession(workshopId, chefId)
        console.log('rech start sesion wsrvs4');

        console.log('rech start sesion wsrvs8');
        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.LIVE,
            isLive: true,
            sessionRoomId: workshop.sessionRoomId || `room_${workshopId}_${Date.now()}`
        });


        if (!updated) throw new AppError('Failed to start session BC OF WORKSHOP', STATUS_CODE.INTERNAL_SERVER_ERROR);
        console.log('rech start sesion wsrvs5');
        if (!session) throw new AppError('Failed to start session BC OF SESSION', STATUS_CODE.INTERNAL_SERVER_ERROR);
        console.log('rech start sesion wsrvs6', updated.id);

        const participants = await this._bookingService.getWorkshopParticipants(workshopId, chefId);
        for (const participant of participants) {
            await this._notificationService.createNotification(
                (participant.foodieId as any)._id ? (participant.foodieId as any)._id.toString() : (participant.foodieId as any).toString(),
                Role.FOODIE,
                'Session Started',
                `The session for workshop "${workshop.title}" has started! Join now.`,
                'SESSION_STARTED',
                workshopId,
                (session as any)._id.toString()
            );
        }

        return { workshop: workshopMapper(updated), session: WorkshopSessionMapper.toResponse(session) };
    }

    async endSession(workshopId: string, chefId: string): Promise<IWorkshopDocument> {
        console.log('reached end sesion');

        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN);
        }

        if (workshop.mode === WorkshopMode.ONLINE) {
            if (workshop.status !== WorkshopStatus.LIVE) {
                throw new AppError('Workshop is not LIVE', STATUS_CODE.BAD_REQUEST);
            }
        } else {
            if (workshop.status !== WorkshopStatus.APPROVED && workshop.status !== WorkshopStatus.UPCOMING && workshop.status !== WorkshopStatus.LIVE) {
                throw new AppError('Workshop cannot be completed from current status', STATUS_CODE.BAD_REQUEST);
            }
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.COMPLETED,
            isLive: false
        });

        if (!updated) throw new AppError('Failed to end session', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async getWorkshopsByChef(chefId: string, page: number, limit: number, search: string, status?: string): Promise<{ datas: IWorkshopDocument[], totalCount: number }> {
        try {
            const skip = (page - 1) * limit;
            const res = await this._workshopRepository.findAllByChefId(chefId, skip, limit, search, status);
            console.log('res=====?', res);

            return res
        } catch (error) {
            throw error;
        }
    }

    async cancelWorkshop(workshopId: string, chefId: string, reason: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) {
            throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);
        }

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized: You are not the owner of this workshop', STATUS_CODE.FORBIDDEN);
        }

        if (workshop.status === WorkshopStatus.COMPLETED || workshop.status === WorkshopStatus.CANCELLED) {
            throw new AppError(`Cannot cancel workshop in ${workshop.status} status`, STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.CANCELLED,
            rejectionReason: reason
        });

        if (!updated) throw new AppError('Failed to cancel workshop', STATUS_CODE.INTERNAL_SERVER_ERROR);

        await this._bookingService.processWorkshopCancellation(workshopId);

        const participants = await this._bookingService.getWorkshopParticipants(workshopId, chefId);
        for (const participant of participants) {
            await this._notificationService.createNotification(
                (participant.foodieId as any)._id ? (participant.foodieId as any)._id.toString() : (participant.foodieId as any).toString(),
                Role.FOODIE,
                'Workshop Cancelled',
                `The workshop "${workshop.title}" has been cancelled. Reason: ${reason}`,
                'SESSION_CANCELLED',
                workshopId
            );
        }

        return updated;
    }

    async getRecentWorkshops(limit: number): Promise<{ data: IWorkshopDocument[] }> {
        const workshops = await this._workshopRepository.findRecentApproved(limit);
        return { data: workshops };
    }
}
