
/**
 * Custom JS Database implementation using localStorage
 * This serves as our "own database" as requested.
 */


export interface DBUser {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: 'admin' | 'user';
    avatar_url?: string | null;
    bio?: string | null;
    location?: string | null;
    experience_years?: number | null;
    instruments?: string[];
    created_at: string;
}

export interface DBAnnouncement {
    id: string;
    user_id: string;
    title: string;
    description: string;
    instrument_needed: string;
    location: string | null;
    genre: string | null;
    experience_required: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    status: 'active' | 'closed' | 'pending';
    created_at: string;
}

const STORAGE_KEYS = {
    USERS: 'app_users',
    ANNOUNCEMENTS: 'app_announcements',
    CURRENT_USER: 'app_current_user',
};

class Database {
    private getData<T>(key: string): T[] {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private setData<T>(key: string, data: T[]): void {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Users
    getUsers(): DBUser[] {
        return this.getData<DBUser>(STORAGE_KEYS.USERS);
    }

    addUser(user: Omit<DBUser, 'created_at'>): DBUser {
        const users = this.getUsers();
        const newUser: DBUser = {
            ...user,
            created_at: new Date().toISOString(),
        };
        users.push(newUser);
        this.setData(STORAGE_KEYS.USERS, users);
        return newUser;
    }

    getUserById(id: string): DBUser | undefined {
        return this.getUsers().find(u => u.id === id);
    }

    updateUser(id: string, updates: Partial<DBUser>): DBUser {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            // If user doesn't exist yet in local DB (e.g. from cloud), create them
            return this.addUser({
                id,
                email: (updates as any).email || 'cloud@user.com',
                username: updates.username || 'user',
                full_name: updates.full_name || 'Cloud User',
                role: 'user',
                ...updates
            });
        }

        users[index] = { ...users[index], ...updates };
        this.setData(STORAGE_KEYS.USERS, users);
        return users[index];
    }

    deleteUser(id: string): void {
        const users = this.getUsers().filter(u => u.id !== id);
        this.setData(STORAGE_KEYS.USERS, users);
    }

    // Announcements
    getAnnouncements(): DBAnnouncement[] {
        return this.getData<DBAnnouncement>(STORAGE_KEYS.ANNOUNCEMENTS);
    }

    addAnnouncement(announcement: Omit<DBAnnouncement, 'id' | 'created_at'>): DBAnnouncement {
        const announcements = this.getAnnouncements();
        const newAd: DBAnnouncement = {
            ...announcement,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
        };
        announcements.push(newAd);
        this.setData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
        return newAd;
    }

    updateAnnouncement(id: string, updates: Partial<DBAnnouncement>): DBAnnouncement {
        const ads = this.getAnnouncements();
        const index = ads.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Announcement not found');

        ads[index] = { ...ads[index], ...updates };
        this.setData(STORAGE_KEYS.ANNOUNCEMENTS, ads);
        return ads[index];
    }

    deleteAnnouncement(id: string): void {
        const ads = this.getAnnouncements().filter(a => a.id !== id);
        this.setData(STORAGE_KEYS.ANNOUNCEMENTS, ads);
    }

    // Initialize with admin if not exists
    init() {
        const users = this.getUsers();
        const adminExists = users.some(u => u.email === 'admin@gmail.com');
        if (!adminExists) {
            users.push({
                id: 'admin-id',
                email: 'admin@gmail.com',
                username: 'admin',
                full_name: 'System Administrator',
                role: 'admin',
                created_at: new Date().toISOString(),
            });
            this.setData(STORAGE_KEYS.USERS, users);
        }
    }
}

export const db = new Database();
db.init();
