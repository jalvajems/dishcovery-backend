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

import { INotificationService } from '../interfaces/INotificationService';

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
            const myBooking = bookings.find(b =>
                b.workshopId.toString() === (workshop._id as any).toString() &&
                (b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'COMPLETED')
            );
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

        // Notify Chef
        await this._notificationService.createNotification(
            (workshop.chefId as any).toString(),
            'chef',
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

        // Notify Chef
        await this._notificationService.createNotification(
            (workshop.chefId as any).toString(),
            'chef',
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

        // Validate time
        const workshopDate = new Date(workshop.date);
        const [hours, minutes] = workshop.startTime.split(':').map(Number);
        workshopDate.setHours(hours, minutes, 0, 0);

        if (new Date() < workshopDate) {
            throw new AppError('Workshop cannot be started before scheduled time', STATUS_CODE.BAD_REQUEST);
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

        // Notify Foodies
        const participants = await this._bookingService.getWorkshopParticipants(workshopId, chefId);
        for (const participant of participants) {
            await this._notificationService.createNotification(
                (participant.foodieId as any)._id ? (participant.foodieId as any)._id.toString() : (participant.foodieId as any).toString(),
                'foodie',
                'Session Started',
                `The session for workshop "${workshop.title}" has started! Join now.`,
                'SESSION_STARTED',
                workshopId,
                (session as any)._id.toString() // Assuming session object has _id
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
            // Offline Mode
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
    //             return res
    //         } catch (error) {
    //     throw error;
    // }
    //     }

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

        // 1. Update Workshop Status
        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.CANCELLED,
            rejectionReason: reason // Using availability of this field or we could add cancellationReason to Workshop model
        });

        if (!updated) throw new AppError('Failed to cancel workshop', STATUS_CODE.INTERNAL_SERVER_ERROR);

        // 2. Process Refunds for Bookings (Async)
        // We use immediate execution but don't await the full completion to return response faster? 
        // OR better await it to ensure consistency if it's not too slow. 
        // Given Stripe rate limits, if many bookings validation is needed. For now, await is safer.

        // We need to inject BookingService here, but circular dependency might occur.
        // If BookingService depends on WorkshopService (it does), we cannot inject BookingService into WorkshopService directly if using constructor injection in some containers without lazy loading.
        // In Inversify we can use LazyServiceIdentifer or just resolve it.
        // However, BookingService already depends on WorkshopService.
        // To avoid Circular Dependency:
        // Option A: Move cancellation logic to a coordination service (e.g. WorkshopOrchestrator).
        // Option B: Emit an event (EventBus).
        // Option C: Use property injection or lazy injection.

        // For simplicity in this architecture, let's try strict layering or just direct call if DI allows.
        // But since I need to modify the file now, I will add the method assuming I can add the dependency.
        // Wait, I see `_workshopRepository` and `_sessionService` injected. I need to add `IBookingService`.

        // Let's check `types.ts` for IBookingService symbol.
        // If circular dependency is an issue, we might need a different approach.
        // BookingService uses WorkshopRepository, not WorkshopService. So it MIGHT be fine if I inject BookingService here.
        // Let's check BookingService imports: it imports IWorkshopRepository, NOT IWorkshopService. 
        // So NO circular dependency between Services!
        // BookingService -> WorkshopRepository
        // WorkshopService -> BookingService (Proposed)
        // This is valid.

        // I will add the dependency in a separate step to the constructor.

        // For now, let's write the method body, I'll update the constructor next.
        await this._bookingService.processWorkshopCancellation(workshopId);

        // Notify Foodies
        const participants = await this._bookingService.getWorkshopParticipants(workshopId, chefId);
        for (const participant of participants) {
            await this._notificationService.createNotification(
                (participant.foodieId as any)._id ? (participant.foodieId as any)._id.toString() : (participant.foodieId as any).toString(),
                'foodie',
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
