import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5000";

class ChatService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on("connect", () => {
    });

    this.socket.on("disconnect", () => {
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPersonalRoom(userId: string) {
    if (this.socket) {
      this.socket.emit("joinRoom", { userId });
    }
  }

  joinDirectChat(studentId: string) {
    if (this.socket) {
      this.socket.emit("joinRoom", { userId: studentId });
    }
  }

  joinGroupChat(groupId: string) {
    if (this.socket) {
      this.socket.emit("joinGroup", { groupId });
    }
  }

  joinCourseChat(courseId: string) {
    if (this.socket) {
      this.socket.emit("joinCourseChat", { courseId });
    }
  }

  sendMessage(data: { roomId: string; receiverId: string; message: string; emoji?: string; replyTo?: string }) {
    if (this.socket) {
      this.socket.emit("sendMessage", data);
    }
  }

  sendGroupMessage(data: { groupRoomId: string; message: string; emoji?: string }) {
    if (this.socket) {
      this.socket.emit("sendGroupMessage", data);
    }
  }

  sendCourseChatMessage(data: {
    courseChatRoomId: string;
    message: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    emoji?: string;
    replyTo?: string
  }) {
    if (this.socket) {
      this.socket.emit("sendCourseChatMessage", data);
    }
  }

  onNewMessage(callback: (msg: any) => void) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  onNewGroupMessage(callback: (msg: any) => void) {
    if (this.socket) {
      this.socket.on("newGroupMessage", callback);
    }
  }

  onNewCourseChatMessage(callback: (msg: any) => void) {
    if (this.socket) {
      this.socket.on("newCourseChatMessage", callback);
    }
  }

  onMessageSent(callback: (msg: any) => void) {
    if (this.socket) {
      this.socket.on("messageSent", callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const chatService = new ChatService();
