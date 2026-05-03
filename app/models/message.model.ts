export interface User {
    _id: string;
    username: string;
    email: string;
    isDeleted?: boolean;
}

export interface Message {
    _id?: string;
    from?: User | string; 
    to?: User[] | string[]; 
    title?: string;
    content?: string;
    sentAt?: Date;
    fromDeleted?: boolean;
    toDeleted?: boolean[];
    unread?: boolean; // Indicates if the message is unread
}

// Helper functions for backward compatibility
export function getFromUsername(message: Message): string {
    if (typeof message.from === 'string') {
        return message.from;
    }
    if (message.from && typeof message.from === 'object') {
        return message.from.username || 'Deleted User';
    }
    return 'Unknown User';
}

export function getToUsernames(message: Message): string[] {
    if (!message.to) return [];
    if (typeof message.to[0] === 'string') {
        return message.to as string[];
    }
    return (message.to as User[]).map(user => user.username || 'Deleted User');
}

export function getFromId(message: Message): string {
    if (typeof message.from === 'string') {
        return ''; // Can't get ID from username alone
    }
    return message.from?._id || '';
}

export function getToIds(message: Message): string[] {
    if (!message.to) return [];
    if (typeof message.to[0] === 'string') {
        return []; // Can't get IDs from usernames alone
    }
    return (message.to as User[]).map(user => user._id);
}

export function isDeletedUser(user: User | string | null | undefined): boolean {
    if (!user) return false;
    if (typeof user === 'string') return false;
    return user.isDeleted === true;
}