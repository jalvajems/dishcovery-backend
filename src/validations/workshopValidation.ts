import { z } from 'zod';
import { WorkshopMode } from '../types/workshop.types';

const locationSchema = z.object({
    venueName: z.string().min(3, 'Venue name is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    latitude: z.number(),
    longitude: z.number(),
});

export const createWorkshopSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    description: z.string().min(20, 'Description must be at least 20 characters long'),
    category: z.string().min(2, 'Category is required'),
    banner: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string().refine((val) => {
        const d = new Date(val);
        d.setHours(23, 59, 59, 999);
        return d >= new Date();
    }, 'Date must be in the future'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    participantLimit: z.number().min(1, 'Participant limit must be at least 1'),
    mode: z.nativeEnum(WorkshopMode),
    isFree: z.boolean(),
    price: z.number().min(0, 'Price cannot be negative'),
    location: locationSchema.optional(),
}).refine((data) => {
    if (data.mode === WorkshopMode.OFFLINE && !data.location) {
        return false;
    }
    return true;
}, {
    message: "Location is required for offline workshops",
    path: ["location"],
}).refine((data) => {
    if (data.isFree && data.price !== 0) {
        return false;
    }
    return true;
}, {
    message: "Price must be 0 if the workshop is free",
    path: ["price"],
}).refine((data) => {
    const workshopDate = new Date(data.date);
    const [hours, minutes] = data.startTime.split(':').map(Number);
    workshopDate.setHours(hours, minutes, 0, 0);
    return workshopDate > new Date();
}, {
    message: "Start time must be in the future",
    path: ["startTime"],
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

export const rejectionSchema = z.object({
    rejectionReason: z.string().min(5, 'Rejection reason must be at least 5 characters long'),
});
