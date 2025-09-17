import { Persona, Has, Need, Match } from './data-models';

// Simple in-memory store to simulate NextGraph repositories
const repositories: Record<string, any[]> = {};

// Utility to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

export const NextGraphMock = {
  /**
   * Simulates creating or getting a NextGraph repository (Personal Chain).
   * In this mock, it's just an in-memory array.
   * @param repoId The ID of the repository (e.g., Persona's public key).
   * @returns A mock repository object.
   */
  getRepository: (repoId: string) => {
    if (!repositories[repoId]) {
      repositories[repoId] = [];
    }
    return {
      id: repoId,
      // Simulate committing data to the repository
      commit: (data: Persona | Has | Need | Match) => {
        const record = { ...data, id: data.id || generateId() };
        repositories[repoId].push(record);
        return record;
      },
      // Simulate querying data from the repository
      query: <T>(filter?: Partial<T>): T[] => {
        let results = repositories[repoId] as T[];
        if (filter) {
          results = results.filter(item => {
            for (const key in filter) {
              if (filter.hasOwnProperty(key) && item[key] !== filter[key]) {
                return false;
              }
            }
            return true;
          });
        }
        return results;
      },
      // Simulate getting the full history (commits)
      getHistory: () => repositories[repoId],
    };
  },

  /**
   * Simulates NextGraph's identity management.
   * In this mock, it generates a simple public key.
   */
  Identity: {
    create: () => ({
      publicKey: generateId(),
    }),
  },

  /**
   * Simulates NextGraph's access control for a unified chain.
   * In this mock, it's a simple filter based on persona.
   */
  AccessControl: {
    filterByPersona: <T extends { personaId?: string }>(data: T[], personaId: string): T[] => {
      return data.filter(item => item.personaId === personaId);
    },
  },
};
