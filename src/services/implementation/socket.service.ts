import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { log } from "../../utils/logger";
import jwt from 'jsonwebtoken';
import { env } from "../../config/env.config";

class SocketService {
    private io: SocketIOServer | null = null;
    private userSocketMap: Map<string, string> = new Map();

    public init(server: HTTPServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.use((socket: Socket, next: (err?: Error) => void) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.token;
            if (!token) return next(new Error("Authentication error: No token provided"));

            try {
                const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string, role: string };
                socket.data.user = decoded;
                next();
            } catch (err) {
                next(new Error("Authentication error: Invalid token"));
            }
        });

        this.io.on("connection", (socket: Socket) => {
            const userId = socket.data.user.id;
            const role = socket.data.user.role;

            this.userSocketMap.set(userId, socket.id);
            socket.join(userId); 
            log.info(`User connected: ${userId} (${role}) - Socket: ${socket.id}`);

            socket.on("join-session", async (workshopId: string) => {
                socket.join(workshopId);
                log.info(`User ${userId} joined session room: ${workshopId}`);

                const socketsInRoom = await this.io?.in(workshopId).fetchSockets();
                const existingUsers = socketsInRoom?.map(s => ({
                    userId: s.data.user.id,
                    role: s.data.user.role
                })).filter(u => u.userId !== userId) || [];

                socket.emit("all-users", existingUsers);

                socket.to(workshopId).emit("participant-joined", {
                    userId,
                    role,
                    socketId: socket.id
                });
            });

            socket.on("webrtc-signal", (data: { to: string, signal: any, from: string }) => {
                const targetSocketId = this.userSocketMap.get(data.to) || data.to;
                if (targetSocketId) {
                    this.io?.to(targetSocketId).emit("webrtc-signal", {
                        from: userId,
                        signal: data.signal
                    });
                }
            });

            socket.on("chef-control", (data: { workshopId: string, targetId: string, action: 'mute' | 'remove' | 'end' }) => {
                if (role !== 'chef') return;

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
                    this.io?.to(data.workshopId).emit("session-ended");
                    this.io?.in(data.workshopId).socketsLeave(data.workshopId);
                }
            });

                                socket.on("chat:join", (conversationId: string) => {
                socket.join(`chat:${conversationId}`);
                log.info(`User ${userId} joined chat room: ${conversationId}`);
            });

            socket.on("chat:leave", (conversationId: string) => {
                socket.leave(`chat:${conversationId}`);
                log.info(`User ${userId} left chat room: ${conversationId}`);
            });

            socket.on("chat:typing", (data: { conversationId: string, isTyping: boolean }) => {
                socket.to(`chat:${data.conversationId}`).emit("chat:typing", {
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
                this.userSocketMap.delete(userId);
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

    public emitToRoom(roomId: string, event: string, data: any): void {
        this.io?.to(roomId).emit(event, data);
    }
}

export const socketService = new SocketService();
