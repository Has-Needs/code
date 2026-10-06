import type { Receipt, Triplet } from '../core/types.js';

export class SovereignStore {
  private triplets = new Map<string, Triplet>();
  private receipts = new Map<string, Receipt>();

  constructor(public readonly owner: string) {}

  addTriplet(triplet: Triplet): void {
    this.triplets.set(triplet.id, triplet);
  }

  addReceipt(receipt: Receipt): void {
    if (!receipt.participants.includes(this.owner)) {
      throw new Error('store owner is not a receipt participant');
    }
    this.receipts.set(receipt.id, receipt);
  }

  getTriplet(id: string): Triplet | undefined {
    return this.triplets.get(id);
  }

  getAll(relation?: Triplet['relation']): Triplet[] {
    const values = [...this.triplets.values()];
    return relation ? values.filter(t => t.relation === relation) : values;
  }

  getReceipts(): Receipt[] {
    return [...this.receipts.values()];
  }
}
