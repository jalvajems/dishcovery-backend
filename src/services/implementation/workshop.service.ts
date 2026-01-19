import { inject, injectable } from 'inversify';
import TYPES from '../../DI/types';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IWorkshopService } from '../interface/IWorkshopService';
import { IWorkshopDocument, WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { AppError } from '../../utils/AppError';
import { STATUS_CODE } from '../../constants/StatusCode';

@injectable()
export class WorkshopService implements IWorkshopService {
    constructor(
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository
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

    async getWorkshopById(id: string): Promise<IWorkshopDocument | null> {
        return await this._workshopRepository.findWithChef(id);
    }

    async getChefWorkshops(chefId: string): Promise<IWorkshopDocument[]> {
        return await this._workshopRepository.findAll({ chefId });
    }

    async getAllWorkshopsForAdmin(): Promise<IWorkshopDocument[]> {
        return await this._workshopRepository.findAll({});
    }

    async getApprovedWorkshops(): Promise<IWorkshopDocument[]> {
        return await this._workshopRepository.findAll({
            status: { $in: [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING, WorkshopStatus.LIVE] }
        });
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

    async startSession(workshopId: string, chefId: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN);
        }

        // Usually workshops move from APPROVED -> UPCOMING (by system) or Chef can start from APPROVED/UPCOMING
        if (workshop.status !== WorkshopStatus.APPROVED && workshop.status !== WorkshopStatus.UPCOMING) {
            throw new AppError('Workshop cannot be started', STATUS_CODE.BAD_REQUEST);
        }

        if (workshop.mode !== WorkshopMode.ONLINE) {
            throw new AppError('Only online workshops can be started', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.LIVE,
            isLive: true,
            sessionRoomId: workshop.sessionRoomId || `room_${workshopId}_${Date.now()}`
        });

        if (!updated) throw new AppError('Failed to start session', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async endSession(workshopId: string, chefId: string): Promise<IWorkshopDocument> {
        const workshop = await this._workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN);
        }

        if (workshop.status !== WorkshopStatus.LIVE) {
            throw new AppError('Workshop is not LIVE', STATUS_CODE.BAD_REQUEST);
        }

        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.COMPLETED,
            isLive: false
        });

        if (!updated) throw new AppError('Failed to end session', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return updated;
    }
}
