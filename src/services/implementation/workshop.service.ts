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

@injectable()
export class WorkshopService implements IWorkshopService {
    constructor(
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository,
        @inject(TYPES.WorkshopSessionService) private _sessionService: IWorkshopSessionService,
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

    async getApprovedWorkshops(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IWorkshopDocument[], totalCount: number }> {
        const skip = (page - 1) * limit;
        return await this._workshopRepository.findAllApprovedWithFilters(skip, limit, search, filter);
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
        console.log('rech start sesion wsrvs4');

        console.log('rech start sesion wsrvs8');
        const session = await this._sessionService.startSession(workshopId, chefId)
        const updated = await this._workshopRepository.updateById(workshopId, {
            status: WorkshopStatus.LIVE,
            isLive: true,
            sessionRoomId: workshop.sessionRoomId || `room_${workshopId}_${Date.now()}`
        });


        if (!updated) throw new AppError('Failed to start session BC OF WORKSHOP', STATUS_CODE.INTERNAL_SERVER_ERROR);
        console.log('rech start sesion wsrvs5');
        if (!session) throw new AppError('Failed to start session BC OF SESSION', STATUS_CODE.INTERNAL_SERVER_ERROR);
        console.log('rech start sesion wsrvs6');
        return { workshop: workshopMapper(updated), session: WorkshopSessionMapper.toResponse(session) };
    }

    async endSession(workshopId: string, chefId: string): Promise<IWorkshopDocument> {
        console.log('reached end sesion');

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

    async getWorkshopsByChef(chefId: string, page: number, limit: number): Promise<{ datas: IWorkshopDocument[], totalCount: number }> {
        try {
            const skip = (page - 1) * limit;
            const res = await this._workshopRepository.findAllByChefId(chefId, skip, limit);
            console.log('ressssss', res);

            return res
        } catch (error) {
            throw error;
        }
    }
}
