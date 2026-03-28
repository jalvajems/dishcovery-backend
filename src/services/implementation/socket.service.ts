import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { log } from "../../utils/logger";
import { Role } from "../../types/user.types";

interface IWebrtcSignalPayload {
    to: string;
    signal: Record<string, unknown>;
}

interface IChefControlPayload {
    action: 'mute' | 'remove' | 'end';
    targetId: string;
    workshopId: string;
}

interface IChatTypingPayload {
    conversationId: string;
    isTyping: boolean;
}

export class SocketService {
    private io: SocketIOServer | null = null;
    private userSocketMap = new Map<string, string>(); // userId -> socketId

    public initialize(server: HttpServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            path: '/socket.io'
        });

        this.io.on("connection", (socket: Socket) => {
            const userId = socket.handshake.auth.token ? (socket.handshake.auth.user?.id || socket.handshake.query.userId) : null;
            const role = socket.handshake.auth.user?.role || socket.handshake.query.role;

            if (!userId) {
                log.warn(`Unknown user tried to connect: ${socket.id}`);
                return;
            }

            this.userSocketMap.set(userId as string, socket.id);
            log.info(`User connected: ${userId} (Socket: ${socket.id}, Role: ${role})`);

            socket.on("join-session", async (workshopId: string) => {
                socket.join(workshopId);
                log.info(`User ${userId} joined workshop session: ${workshopId}`);
                
                // Get all users currently in the room to send to the new joiner
                const sockets = await this.io?.in(workshopId).fetchSockets();
                const usersInRoom = sockets?.map(s => ({
                    userId: s.handshake.auth.user?.id || s.handshake.query.userId,
                    role: s.handshake.auth.user?.role || s.handshake.query.role
                })).filter(u => u.userId !== userId) || [];

                log.info(`Sending ${usersInRoom.length} existing users to joiner ${userId}`);
                socket.emit("all-users", usersInRoom);

                // Notify others in the room
                socket.to(workshopId).emit("participant-joined", {
                    userId,
                    socketId: socket.id,
                    role
                });
            });

            socket.on("webrtc-signal", (data: IWebrtcSignalPayload) => {
                const targetSocketId = this.userSocketMap.get(data.to) || data.to;
                if (targetSocketId) {
                    log.info(`[Signaling] From ${userId} to ${data.to} (Socket: ${targetSocketId})`);
                    this.io?.to(targetSocketId).emit("webrtc-signal", {
                        from: userId,
                        signal: data.signal
                    });
                } else {
                    log.warn(`[Signaling] Target ${data.to} not found for user ${data.to}`);
                }
            });

            socket.on("chef-control", (data: IChefControlPayload) => {
                if (role !== Role.CHEF) return;

                const targetSocketId = this.userSocketMap.get(data.targetId);

                if (data.action === 'mute') {
                    if (targetSocketId) this.io?.to(targetSocketId).emit("chef-action", { action: 'mute' });
                    this.io?.to(data.workshopId).emit("participant-muted", { userId: data.targetId });
                } else if (data.action === 'remove') {
                    if (targetSocketId) {
                        this.io?.to(targetSocketId).emit("chef-action", { action: 'remove' });
                        const targetSocket = this.io?.sockets.sockets.get(targetSocketId);
                        targetSocket?.leave(data.workshopId);
                    }
                    this.io?.to(data.workshopId).emit("participant-removed", { userId: data.targetId });
                } else if (data.action === 'end') {
                    log.info(`Chef ${userId} is ending session: ${data.workshopId}`);
                    this.io?.to(data.workshopId).emit("session-ended");
                    // Delay leaving to ensure broadcast reaches everyone
                    setTimeout(() => {
                        this.io?.in(data.workshopId).socketsLeave(data.workshopId);
                    }, 1000);
                }
            });

            socket.on("chat:join", (conversationId: string) => {
                const room = `chat:${conversationId}`;
                socket.join(room);
                log.info(`[Socket] User ${userId} joined room: ${room}`);
            });

            socket.on("chat:leave", (conversationId: string) => {
                const room = `chat:${conversationId}`;
                socket.leave(room);
                log.info(`[Socket] User ${userId} left room: ${room}`);
            });

            socket.on("chat:typing", (data: IChatTypingPayload) => {
                const room = `chat:${data.conversationId}`;
                log.info(`[Socket] User ${userId} is typing in room: ${room}`);
                socket.to(room).emit("chat:typing", {
                    userId,
                    isTyping: data.isTyping
                });
            });

            socket.on("disconnecting", () => {
                const rooms = Array.from(socket.rooms);
                rooms.forEach(room => {
                    if (room !== socket.id) {
                        socket.to(room).emit("user-disconnected", userId);
                    }
                });
            });

            socket.on("disconnect", () => {
                this.userSocketMap.delete(userId as string);
                log.info(`User disconnected: ${userId}`);
            });
        });
    }

    public getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error("Socket.io not initialized");
        }
        return this.io;
    }

    public emitToRoom(roomId: string, event: string, data: unknown): void {
        log.info(`[Socket] Broadcasting ${event} to room ${roomId}`);
        this.io?.to(roomId).emit(event, data);
    }
}

export const socketService = new SocketService();
