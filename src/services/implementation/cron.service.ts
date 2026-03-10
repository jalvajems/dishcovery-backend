import { inject, injectable } from 'inversify';
import cron from 'node-cron';
import { Types } from 'mongoose';
import TYPES from '../../DI/types';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IBookingService } from '../interface/IBookingService';
import { INotificationService } from '../interface/INotificationService';
import { ICronService } from '../interface/ICronService';
import { WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { logger } from '../../utils/logger';
import { Role } from '../../types/user.types';
import { IUserDto } from '../../dtos/user.dtos';

@injectable()
export class CronService implements ICronService {
    constructor(
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository,
        @inject(TYPES.IBookingService) private _bookingService: IBookingService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService
    ) { }

    init(): void {
        logger.info('Cron Service Initialized');
        // Run every 15 minutes
        cron.schedule('*/15 * * * *', async () => {
            await this.checkExpiredWorkshops();
        });
    }

    private async checkExpiredWorkshops(): Promise<void> {
        try {
            logger.info('Running Cron Job: Checking for expired workshops...');

            // Find workshops that are APPROVED or UPCOMING
            // We want workshops where start time + 1 hour < current time
            // And they haven't been started (status is not LIVE or COMPLETED, which is covered by finding APPROVED/UPCOMING)

            const workshops = await this._workshopRepository.findAll({
                status: { $in: [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING] }
            });

            const now = new Date();

            for (const workshop of workshops) {
                const workshopDate = new Date(workshop.date);
                const [hours, minutes] = workshop.startTime.split(':').map(Number);
                workshopDate.setHours(hours, minutes, 0, 0);

                let isExpired = false;

                if (workshop.mode === WorkshopMode.ONLINE) {
                    const oneHourAfterStart = new Date(workshopDate.getTime() + 60 * 60 * 1000);
                    if (now > oneHourAfterStart) {
                        isExpired = true;
                    }
                } else if (workshop.mode === WorkshopMode.OFFLINE) {
                    const oneDayAfterStart = new Date(workshopDate.getTime() + 24 * 60 * 60 * 1000);
                    if (now > oneDayAfterStart) {
                        isExpired = true;
                    }
                }

                if (isExpired) {
                    logger.info(`Workshop ${workshop._id} expired. Processing expiration...`);

                    await this._workshopRepository.updateById(workshop._id as string, {
                        status: WorkshopStatus.EXPIRED,
                        cancellationReason: 'Automatic Expiration: Chef did not start the session on time.'
                    });

                    // Trigger refunds/cancellations
                    const reason = 'Workshop expired (Chef did not start on time)';
                    await this._bookingService.processWorkshopCancellation(workshop._id as string, reason);

                    const chefIdString = (workshop.chefId instanceof Types.ObjectId)
                        ? workshop.chefId.toString()
                        : workshop.chefId as string;

                    // Notify Chef
                    await this._notificationService.createNotification(
                        chefIdString,
                        Role.CHEF,
                        'Workshop Expired',
                        `Your workshop "${workshop.title}" has been marked as expired because it was not started on time.`,
                        'WORKSHOP_EXPIRED',
                        workshop._id as string
                    );

                    const participants = await this._bookingService.getWorkshopParticipants(workshop._id as string, chefIdString);
                    for (const participant of participants) {
                        const foodieIdString = typeof participant.foodieId === 'object' && participant.foodieId !== null
                            ? String((participant.foodieId as Partial<IUserDto>)._id || participant.foodieId)
                            : String(participant.foodieId);

                        await this._notificationService.createNotification(
                            foodieIdString,
                            Role.FOODIE,
                            'Workshop Expired',
                            `The workshop "${workshop.title}" has been expired because the host did not start it on time. A refund has been initiated.`,
                            'WORKSHOP_EXPIRED',
                            workshop._id as string
                        );
                    }
                }
            }
        } catch (error) {
            logger.error('Error in Cron Job (checkExpiredWorkshops):', error);
        }
    }
}
