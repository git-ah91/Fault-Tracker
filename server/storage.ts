import { 
  users, 
  faultRecords, 
  autoCompleteItems, 
  activityLog,
  type User, 
  type InsertUser, 
  type FaultRecord, 
  type InsertFaultRecord,
  type AutoCompleteItem,
  type InsertAutoCompleteItem,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Fault records
  createFaultRecord(record: InsertFaultRecord): Promise<FaultRecord>;
  getFaultRecord(id: number): Promise<FaultRecord | undefined>;
  getAllFaultRecords(): Promise<FaultRecord[]>;
  updateFaultRecord(id: number, record: Partial<FaultRecord>): Promise<FaultRecord | undefined>;
  deleteFaultRecord(id: number): Promise<boolean>;
  deleteAllFaultRecords(): Promise<void>;
  searchFaultRecords(query: string): Promise<FaultRecord[]>;
  getFaultRecordsByStatus(status: string): Promise<FaultRecord[]>;
  getFaultRecordsByLocation(location: string): Promise<FaultRecord[]>;
  getNextFaultId(): Promise<number>;

  // Auto-complete
  getAutoCompleteItems(category: string): Promise<AutoCompleteItem[]>;
  addAutoCompleteItem(item: InsertAutoCompleteItem): Promise<AutoCompleteItem>;
  updateAutoCompleteUsage(category: string, value: string): Promise<void>;
  deleteAutoCompleteItem(id: number): Promise<boolean>;

  // Activity log
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLog(): Promise<ActivityLog[]>;
  getUserActivity(userId: number): Promise<ActivityLog[]>;

  // Statistics
  getFaultStatistics(): Promise<{
    totalFaults: number;
    openFaults: number;
    resolvedFaults: number;
    avgRepairTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private faultRecords: Map<number, FaultRecord> = new Map();
  private autoCompleteItems: Map<number, AutoCompleteItem> = new Map();
  private activityLog: Map<number, ActivityLog> = new Map();
  private currentUserId: number = 1;
  private currentFaultId: number = 1;
  private currentAutoCompleteId: number = 1;
  private currentActivityId: number = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default users
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123",
      fullName: "John Admin",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };

    const editorUser: User = {
      id: this.currentUserId++,
      username: "editor",
      password: "editor123",
      fullName: "Jane Editor",
      role: "editor",
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };

    const viewerUser: User = {
      id: this.currentUserId++,
      username: "viewer",
      password: "viewer123",
      fullName: "Mike Viewer",
      role: "viewer",
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(editorUser.id, editorUser);
    this.users.set(viewerUser.id, viewerUser);

    // Seed auto-complete data
    const categories = [
      { category: "equipmentType", values: ["Pump", "Motor", "Valve", "Compressor", "Generator"] },
      { category: "location", values: ["Building A", "Building B", "Building C", "Warehouse", "Production Floor"] },
      { category: "equipmentClassification", values: ["Critical", "Important", "Standard", "Non-critical"] },
      { category: "relevantState", values: ["Running", "Stopped", "Maintenance", "Standby"] },
    ];

    categories.forEach(({ category, values }) => {
      values.forEach(value => {
        const item: AutoCompleteItem = {
          id: this.currentAutoCompleteId++,
          category,
          value,
          usage_count: 0,
        };
        this.autoCompleteItems.set(item.id, item);
      });
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Fault records
  async createFaultRecord(insertRecord: InsertFaultRecord): Promise<FaultRecord> {
    const record: FaultRecord = {
      ...insertRecord,
      id: this.currentFaultId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.faultRecords.set(record.id, record);
    
    // Update auto-complete usage
    await this.updateAutoCompleteUsage("equipmentType", record.equipmentType);
    await this.updateAutoCompleteUsage("location", record.location);
    await this.updateAutoCompleteUsage("equipmentClassification", record.equipmentClassification);
    await this.updateAutoCompleteUsage("relevantState", record.relevantState);
    
    return record;
  }

  async getFaultRecord(id: number): Promise<FaultRecord | undefined> {
    return this.faultRecords.get(id);
  }

  async getAllFaultRecords(): Promise<FaultRecord[]> {
    return Array.from(this.faultRecords.values()).sort((a, b) => b.id - a.id);
  }

  async updateFaultRecord(id: number, recordData: Partial<FaultRecord>): Promise<FaultRecord | undefined> {
    const record = this.faultRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...recordData, updatedAt: new Date() };
    this.faultRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteFaultRecord(id: number): Promise<boolean> {
    return this.faultRecords.delete(id);
  }

  async deleteAllFaultRecords(): Promise<void> {
    this.faultRecords.clear();
    this.currentFaultId = 1;
  }

  async searchFaultRecords(query: string): Promise<FaultRecord[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.faultRecords.values()).filter(record =>
      record.faultDescription.toLowerCase().includes(lowercaseQuery) ||
      record.equipmentType.toLowerCase().includes(lowercaseQuery) ||
      record.location.toLowerCase().includes(lowercaseQuery) ||
      record.faultReporter.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getFaultRecordsByStatus(status: string): Promise<FaultRecord[]> {
    return Array.from(this.faultRecords.values()).filter(record => record.status === status);
  }

  async getFaultRecordsByLocation(location: string): Promise<FaultRecord[]> {
    return Array.from(this.faultRecords.values()).filter(record => record.location === location);
  }

  async getNextFaultId(): Promise<number> {
    return this.currentFaultId;
  }

  // Auto-complete
  async getAutoCompleteItems(category: string): Promise<AutoCompleteItem[]> {
    return Array.from(this.autoCompleteItems.values())
      .filter(item => item.category === category)
      .sort((a, b) => b.usage_count - a.usage_count);
  }

  async addAutoCompleteItem(insertItem: InsertAutoCompleteItem): Promise<AutoCompleteItem> {
    const item: AutoCompleteItem = {
      ...insertItem,
      id: this.currentAutoCompleteId++,
    };
    this.autoCompleteItems.set(item.id, item);
    return item;
  }

  async updateAutoCompleteUsage(category: string, value: string): Promise<void> {
    const item = Array.from(this.autoCompleteItems.values())
      .find(item => item.category === category && item.value === value);
    
    if (item) {
      item.usage_count++;
      this.autoCompleteItems.set(item.id, item);
    } else {
      // Add new item if it doesn't exist
      await this.addAutoCompleteItem({ category, value, usage_count: 1 });
    }
  }

  async deleteAutoCompleteItem(id: number): Promise<boolean> {
    return this.autoCompleteItems.delete(id);
  }

  // Activity log
  async logActivity(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const activity: ActivityLog = {
      ...insertActivity,
      id: this.currentActivityId++,
      timestamp: new Date(),
    };
    this.activityLog.set(activity.id, activity);
    return activity;
  }

  async getActivityLog(): Promise<ActivityLog[]> {
    return Array.from(this.activityLog.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getUserActivity(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLog.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Statistics
  async getFaultStatistics(): Promise<{
    totalFaults: number;
    openFaults: number;
    resolvedFaults: number;
    avgRepairTime: number;
  }> {
    const records = Array.from(this.faultRecords.values());
    const totalFaults = records.length;
    const openFaults = records.filter(r => r.status === "open").length;
    const resolvedFaults = records.filter(r => r.status === "resolved").length;
    const repairTimes = records.filter(r => r.timeToRepair).map(r => r.timeToRepair!);
    const avgRepairTime = repairTimes.length > 0 ? 
      repairTimes.reduce((sum, time) => sum + time, 0) / repairTimes.length : 0;

    return {
      totalFaults,
      openFaults,
      resolvedFaults,
      avgRepairTime: Math.round(avgRepairTime * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
