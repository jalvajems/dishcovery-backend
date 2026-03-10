export interface ISignalData {
    [key: string]: unknown;
}

export interface IWebrtcSignalPayload {
    to: string;
    signal: ISignalData;
    from: string;
}

export interface IChefControlPayload {
    workshopId: string;
    targetId: string;
    action: 'mute' | 'remove' | 'end';
}

export interface IChatTypingPayload {
    conversationId: string;
    isTyping: boolean;
}
