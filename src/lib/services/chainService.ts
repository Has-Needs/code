import * as fs from 'fs';
import * as path from 'path';
import { 
  UserChain, HasList, NeedList, 
  UserChainEntry, HasEntry, NeedEntry, 
  Location, Metadata 
} from '../types/chain';

const DATA_DIR = path.join(process.cwd(), 'data');
const USER_CHAIN_FILE = path.join(DATA_DIR, 'user-chain.json');
const HAS_LIST_FILE = path.join(DATA_DIR, 'has-list.json');
const NEED_LIST_FILE = path.join(DATA_DIR, 'need-list.json');

// Initialize data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize user chain file if it doesn't exist
if (!fs.existsSync(USER_CHAIN_FILE)) {
  const initialUserChain: UserChain = {
    version: '1.0.0',
    lastUpdated: Date.now(),
    entries: {}
  };
  fs.writeFileSync(USER_CHAIN_FILE, JSON.stringify(initialUserChain, null, 2));
}

// Initialize has list file if it doesn't exist
if (!fs.existsSync(HAS_LIST_FILE)) {
  const initialHasList: HasList = {
    version: '1.0.0',
    lastUpdated: Date.now(),
    entries: {}
  };
  fs.writeFileSync(HAS_LIST_FILE, JSON.stringify(initialHasList, null, 2));
}

// Initialize need list file if it doesn't exist
if (!fs.existsSync(NEED_LIST_FILE)) {
  const initialNeedList: NeedList = {
    version: '1.0.0',
    lastUpdated: Date.now(),
    entries: {}
  };
  fs.writeFileSync(NEED_LIST_FILE, JSON.stringify(initialNeedList, null, 2));
}

// Helper functions for file operations
function readJsonFile<T>(filePath: string): T {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    throw error;
  }
}

// User Chain Operations
const userChainService = {
  // Add a new user to the chain
  addUser(userId: string, publicKey: string, metadata?: Metadata): UserChainEntry {
    const userChain = readJsonFile<UserChain>(USER_CHAIN_FILE);
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: UserChainEntry = {
      id,
      timestamp: Date.now(),
      type: 'user',
      userId,
      publicKey,
      metadata
    };
    
    userChain.entries[id] = newEntry;
    userChain.lastUpdated = Date.now();
    writeJsonFile(USER_CHAIN_FILE, userChain);
    return newEntry;
  },

  // Get a user by ID
  getUser(userId: string): UserChainEntry | undefined {
    const userChain = readJsonFile<UserChain>(USER_CHAIN_FILE);
    return Object.values(userChain.entries).find(entry => entry.userId === userId);
  },

  // Get all users
  getAllUsers(): UserChainEntry[] {
    const userChain = readJsonFile<UserChain>(USER_CHAIN_FILE);
    return Object.values(userChain.entries);
  }
};

// Has List Operations
const hasListService = {
  // Add a new has entry
  addHas(entry: Omit<HasEntry, 'id' | 'timestamp' | 'status'>): HasEntry {
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    const id = `has_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: HasEntry = {
      ...entry,
      id,
      timestamp: Date.now(),
      status: 'available'
    };
    
    hasList.entries[id] = newEntry;
    hasList.lastUpdated = Date.now();
    writeJsonFile(HAS_LIST_FILE, hasList);
    return newEntry;
  },

  // Update a has entry
  updateHas(id: string, updates: Partial<HasEntry>): HasEntry | undefined {
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    if (!hasList.entries[id]) return undefined;
    
    const updatedEntry = { ...hasList.entries[id], ...updates };
    hasList.entries[id] = updatedEntry;
    hasList.lastUpdated = Date.now();
    writeJsonFile(HAS_LIST_FILE, hasList);
    return updatedEntry;
  },

  // Get a has entry by ID
  getHas(id: string): HasEntry | undefined {
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    return hasList.entries[id];
  },

  // Get all has entries
  getAllHashes(): HasEntry[] {
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    return Object.values(hasList.entries);
  },

  // Get available has entries
  getAvailableHashes(): HasEntry[] {
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    return Object.values(hasList.entries).filter(entry => entry.status === 'available');
  }
};

// Need List Operations
const needListService = {
  // Add a new need entry
  addNeed(entry: Omit<NeedEntry, 'id' | 'timestamp' | 'status'>): NeedEntry {
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    const id = `need_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: NeedEntry = {
      ...entry,
      id,
      timestamp: Date.now(),
      status: 'active'
    };
    
    needList.entries[id] = newEntry;
    needList.lastUpdated = Date.now();
    writeJsonFile(NEED_LIST_FILE, needList);
    return newEntry;
  },

  // Update a need entry
  updateNeed(id: string, updates: Partial<NeedEntry>): NeedEntry | undefined {
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    if (!needList.entries[id]) return undefined;
    
    const updatedEntry = { ...needList.entries[id], ...updates };
    needList.entries[id] = updatedEntry;
    needList.lastUpdated = Date.now();
    writeJsonFile(NEED_LIST_FILE, needList);
    return updatedEntry;
  },

  // Get a need entry by ID
  getNeed(id: string): NeedEntry | undefined {
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    return needList.entries[id];
  },

  // Get all need entries
  getAllNeeds(): NeedEntry[] {
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    return Object.values(needList.entries);
  },

  // Get active needs
  getActiveNeeds(): NeedEntry[] {
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    return Object.values(needList.entries).filter(need => need.status === 'active');
  }
};

// Combined service
export const chainService = {
  users: userChainService,
  has: hasListService,
  need: needListService,

  // Get combined stats
  getStats() {
    const userChain = readJsonFile<UserChain>(USER_CHAIN_FILE);
    const hasList = readJsonFile<HasList>(HAS_LIST_FILE);
    const needList = readJsonFile<NeedList>(NEED_LIST_FILE);
    
    const activeHashes = Object.values(hasList.entries).filter(h => h.status === 'available');
    const activeNeeds = Object.values(needList.entries).filter(n => n.status === 'active');
    
    return {
      users: Object.keys(userChain.entries).length,
      hasEntries: Object.keys(hasList.entries).length,
      needEntries: Object.keys(needList.entries).length,
      activeHashes: activeHashes.length,
      activeNeeds: activeNeeds.length,
      lastUpdated: {
        users: new Date(userChain.lastUpdated).toISOString(),
        has: new Date(hasList.lastUpdated).toISOString(),
        need: new Date(needList.lastUpdated).toISOString()
      }
    };
  },

  // Fulfill a need with a has
  fulfillNeed(needId: string, hasId: string): boolean {
    const need = needListService.getNeed(needId);
    const has = hasListService.getHas(hasId);
    
    if (!need || !has || need.status !== 'active' || has.status !== 'available') {
      return false;
    }
    
    // Update need
    needListService.updateNeed(needId, {
      status: 'fulfilled',
      fulfilledBy: hasId
    });
    
    // Update has
    hasListService.updateHas(hasId, {
      status: 'fulfilled',
      fulfilledBy: needId
    });
    
    return true;
  },
  
  // Reserve a has for a need
  reserveHas(needId: string, hasId: string): boolean {
    const need = needListService.getNeed(needId);
    const has = hasListService.getHas(hasId);
    
    if (!need || !has || need.status !== 'active' || has.status !== 'available') {
      return false;
    }
    
    // Update need
    needListService.updateNeed(needId, {
      status: 'reserved'
    });
    
    // Update has
    hasListService.updateHas(hasId, {
      status: 'reserved',
      reservedBy: need.ownerId
    });
    
    return true;
  }
};

export default chainService;
