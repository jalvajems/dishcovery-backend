import { Types, Document } from 'mongoose';

export enum WorkshopStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    UPCOMING = 'UPCOMING',
    LIVE = 'LIVE',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED'
}

export enum WorkshopMode {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

export interface ILocation {
    venueName: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
}

export interface IWorkshop {
    title: string;
    description: string;
    category: string;
    banner?: string;
    tags?: string[];
    chefId: string | Types.ObjectId;

    date: Date;
    startTime: string;
    duration: number;
    participantLimit: number;

    mode: WorkshopMode;
    isFree: boolean;
    price: number;

    location?: ILocation;

    sessionRoomId?: string;
    hostId?: string | Types.ObjectId;
    isLive?: boolean;

    status: WorkshopStatus;
    approvedAt?: Date;
    approvedBy?: string | Types.ObjectId;
    rejectionReason?: string;
    cancellationReason?: string;

    participantsCount: number;

    createdAt?: Date;
    updatedAt?: Date;

    isBooked?: boolean;
}

export interface IWorkshopDocument extends IWorkshop, Document { }
