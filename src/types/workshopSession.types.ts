import { Types, Document } from 'mongoose';

export enum SessionEvent {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    MUTE = 'MUTE',
    UNMUTE = 'UNMUTE',
    REMOVE = 'REMOVE'
}

export interface ISessionParticipant {
    foodieId: Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    isMuted: boolean;
}

export interface ISessionLog {
    type: SessionEvent;
    userId: Types.ObjectId;
    timestamp: Date;
    metadata?: any;
}

export interface IWorkshopSession {
    workshopId: Types.ObjectId;
    chefId: Types.ObjectId;
    roomId: string;
    isLive: boolean;
    startedAt: Date;
    endedAt?: Date;
    participants: ISessionParticipant[];
    logs: ISessionLog[];
}

export interface IWorkshopSessionDocument extends IWorkshopSession, Document { }
