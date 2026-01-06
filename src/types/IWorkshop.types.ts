import { WorkshopMode, WorkshopStatus, WorkshopType } from "../models/workshop.model";

export interface IWorkshop{
     
        chefId: object;
        title: string;
    
        description: string;
    
        category: string;
    
        startDateTime: Date;
    
        durationInMinutes: number;

        participantLimit: number;
        mode: WorkshopMode;
        location: {
          address?:string;
          city?:string;
          latitude?:number;
          longitude?: number;
        },
    
        // 💰 Pricing
        type:WorkshopType;
    
        price: number;
    
        currency: string;
    
        status: WorkshopStatus;
        approvedBy:Object;
        approvedAt:Date;

        rejectionReason:string;
        isSessionActive: boolean;
    
        sessionStartedAt: Date;

        sessionEndedAt: Date;

        totalBookings: number;
        createdAt: Date;
    
        updatedAt: Date;
}