import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertFaultRecordSchema, 
  updateFaultStatusSchema,
  insertAutoCompleteItemSchema,
  type User 
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "maintenance-fault-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Activity logging middleware
  const logActivity = async (req: any, res: any, next: any) => {
    if (req.session.user) {
      const originalSend = res.send;
      res.send = function(data: any) {
        // Log activity after successful response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const action = req.method;
          const target = req.path;
          storage.logActivity({
            userId: req.session.user.id,
            action,
            target,
            details: `${action} ${target}`,
            ipAddress: req.ip,
          });
        }
        return originalSend.call(this, data);
      };
    }
    next();
  };

  app.use(logActivity);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      req.session.user = user;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: { ...req.session.user, password: undefined } });
  });

  // User management routes (Admin only)
  app.get("/api/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (success) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Fault record routes
  app.get("/api/faults", requireAuth, async (req, res) => {
    try {
      const { search, status, location } = req.query;
      let faults;

      if (search) {
        faults = await storage.searchFaultRecords(search as string);
      } else if (status && status !== "all") {
        faults = await storage.getFaultRecordsByStatus(status as string);
      } else if (location && location !== "all") {
        faults = await storage.getFaultRecordsByLocation(location as string);
      } else {
        faults = await storage.getAllFaultRecords();
      }

      res.json(faults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fault records" });
    }
  });

  // Get next fault ID
  app.get("/api/faults/next-id", requireAuth, requireRole(["editor", "admin"]), async (req, res) => {
    try {
      const nextId = await storage.getNextFaultId();
      res.json({ nextId });
    } catch (error) {
      res.status(500).json({ message: "Failed to get next fault ID" });
    }
  });

  app.get("/api/faults/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fault = await storage.getFaultRecord(id);
      if (fault) {
        res.json(fault);
      } else {
        res.status(404).json({ message: "Fault record not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fault record" });
    }
  });

  app.post("/api/faults", requireAuth, requireRole(["editor", "admin"]), async (req, res) => {
    try {
      const faultData = insertFaultRecordSchema.parse(req.body);
      const fault = await storage.createFaultRecord(faultData);
      res.json(fault);
    } catch (error) {
      res.status(400).json({ message: "Invalid fault data" });
    }
  });

  app.put("/api/faults/:id", requireAuth, requireRole(["editor", "admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faultData = updateFaultStatusSchema.parse(req.body);
      const fault = await storage.updateFaultRecord(id, faultData);
      if (fault) {
        res.json(fault);
      } else {
        res.status(404).json({ message: "Fault record not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid fault data" });
    }
  });

  app.delete("/api/faults/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFaultRecord(id);
      if (success) {
        res.json({ message: "Fault record deleted successfully" });
      } else {
        res.status(404).json({ message: "Fault record not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fault record" });
    }
  });

  app.delete("/api/faults", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      await storage.deleteAllFaultRecords();
      res.json({ message: "All fault records deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all fault records" });
    }
  });

  // Statistics
  app.get("/api/statistics", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getFaultStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Auto-complete routes
  app.get("/api/autocomplete/:category", requireAuth, async (req, res) => {
    try {
      const category = req.params.category;
      const items = await storage.getAutoCompleteItems(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auto-complete items" });
    }
  });

  app.post("/api/autocomplete", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const itemData = insertAutoCompleteItemSchema.parse(req.body);
      const item = await storage.addAutoCompleteItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid auto-complete data" });
    }
  });

  app.delete("/api/autocomplete/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAutoCompleteItem(id);
      if (success) {
        res.json({ message: "Auto-complete item deleted successfully" });
      } else {
        res.status(404).json({ message: "Auto-complete item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete auto-complete item" });
    }
  });

  // Activity log (Admin only)
  app.get("/api/activity", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const activities = await storage.getActivityLog();
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u.fullName]));
      
      const enrichedActivities = activities.map(activity => ({
        ...activity,
        userName: userMap.get(activity.userId) || "Unknown"
      }));
      
      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
