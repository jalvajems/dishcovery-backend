import { inject, injectable } from 'inversify';
import cron from 'node-cron';
import TYPES from '../../DI/types';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IBookingService } from '../interface/IBookingService';
import { INotificationService } from '../interface/INotificationService';
import { ICronService } from '../interface/ICronService';
import { WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { logger } from '../../utils/logger';
import { Role } from '../../types/user.types';

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
                status: { $in: [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING] },
                mode: WorkshopMode.ONLINE
            });

            const now = new Date();

            for (const workshop of workshops) {
                const workshopDate = new Date(workshop.date);
                const [hours, minutes] = workshop.startTime.split(':').map(Number);
                workshopDate.setHours(hours, minutes, 0, 0);

                const oneHourAfterStart = new Date(workshopDate.getTime() + 60 * 60 * 1000);

                if (now > oneHourAfterStart) {
                    logger.info(`Workshop ${workshop._id} expired. Processing expiration...`);

                    // Mark as EXPIRED using the repository directly or via service if we want to reuse logic, 
                    // but we need to bypass some checks or just use update logic. 
                    // WorkshopService.cancelWorkshop might be too restrictive or require chefId.
                    // So we'll implement specific expiration logic here using repository.

                    await this._workshopRepository.updateById(workshop._id as string, {
                        status: WorkshopStatus.EXPIRED,
                        cancellationReason: 'Automatic Expiration: Chef did not start the session on time.'
                    });

                    // Trigger refunds/cancellations
                    const reason = 'Workshop expired (Chef did not start on time)';
                    await this._bookingService.processWorkshopCancellation(workshop._id as string, reason);

                    // Notify Chef
                    await this._notificationService.createNotification(
                        (workshop.chefId as any).toString(),
                        Role.CHEF,
                        'Workshop Expired',
                        `Your workshop "${workshop.title}" has been marked as expired because it was not started on time.`,
                        'WORKSHOP_EXPIRED',
                        workshop._id as string
                    );

                    // Notify Participants (Foodies)
                    // The BookingService.processWorkshopCancellation (or equivalent) might not send notifications? 
                    // Let's check BookingService.processWorkshopCancellation.
                    // It DOES NOT send notifications, it just processes refunds/status updates.
                    // WorkshopService.cancelWorkshop DOES send notifications, but we are doing it manually here.
                    // So we need to fetch participants and notify them.

                    const participants = await this._bookingService.getWorkshopParticipants(workshop._id as string, (workshop.chefId as any).toString());
                    for (const participant of participants) {
                        await this._notificationService.createNotification(
                            (participant.foodieId as any)._id ? (participant.foodieId as any)._id.toString() : (participant.foodieId as any).toString(),
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
