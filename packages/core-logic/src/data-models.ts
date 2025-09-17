export interface Persona {
  id: string;
  name: string;
  publicKey: string;
  // Add other minimal persona-related fields here
}

export interface Has {
  id: string;
  title: string;
  description: string;
  locationContext: string; // Abstracted location (e.g., Community ID)
  contentCid?: string; // Optional: IPFS CID for associated content
  // Add other minimal Has-related fields here
}

export interface Need {
  id: string;
  title: string;
  description: string;
  locationContext: string; // Abstracted location (e.g., Community ID)
  // Add other minimal Need-related fields here
}

export interface Match {
  id: string;
  hasId: string;
  needId: string;
  timestamp: string; // ISO string
  status: 'pending' | 'accepted' | 'completed' | 'disputed';
  encryptedReceipt?: string; // Optional: Encrypted proof of financial transaction
  // Add other minimal Match-related fields here
}
