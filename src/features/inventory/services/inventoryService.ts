import { apiClient } from '@/lib/api/client';
import { Chemical } from '../types';
import { ChemicalFormData } from '../components/ChemicalFormDialog';

/**
 * Service for inventory/chemical API operations
 */
class InventoryService {
  private readonly endpoint = 'inventory';

  /**
   * Fetch all chemicals from the inventory
   */
  async getChemicals(): Promise<Chemical[]> {
    return apiClient.get<Chemical[]>(this.endpoint);
  }

  /**
   * Get a single chemical by ID
   */
  async getChemical(id: string): Promise<Chemical> {
    return apiClient.get<Chemical>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new chemical in the inventory
   */
  async createChemical(data: ChemicalFormData, willPrintLabel: boolean = false): Promise<Chemical> {
    // Get all chemicals to determine next ID
    const allChemicals = await this.getChemicals();
    const nextId = this.generateNextId(allChemicals);

    // Transform form data to match database schema
    const chemicalData = this.transformFormToChemical(data, willPrintLabel);

    // Generate Formula with the new ID
    const formula = JSON.stringify({
      id: nextId,
      uuid: '', // Empty for now, not using Notion integration
    });

    // Add id and Formula to the chemical data
    const completeChemicalData = {
      ...chemicalData,
      id: nextId,
      Formula: formula,
    };

    const newChemical = await apiClient.post<Chemical>(this.endpoint, completeChemicalData);
    return newChemical;
  }

  /**
   * Generate the next sequential chemical ID (CHEM-XXXX)
   */
  private generateNextId(chemicals: Chemical[]): string {
    // Extract numeric parts from all IDs (e.g., CHEM-1101 -> 1101)
    const numericIds = chemicals
      .map((c) => {
        const match = c.id.match(/CHEM-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    // Find the highest number and add 1
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1100;
    const nextNum = maxId + 1;

    return `CHEM-${nextNum}`;
  }

  /**
   * Update an existing chemical
   */
  async updateChemical(id: string, data: Partial<Chemical>): Promise<Chemical> {
    return apiClient.put<Chemical>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a chemical from inventory
   */
  async deleteChemical(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Transform form data to database chemical format
   */
  private transformFormToChemical(
    formData: ChemicalFormData,
    willPrintLabel: boolean
  ): Omit<Chemical, 'ID'> {
    const now = new Date().toISOString();

    // Parse numeric values
    const maxVolume = parseFloat(formData.maxVolume) || 0;
    const initialWeight = parseFloat(formData.initialWeight) || 0;
    const currentWeight = parseFloat(formData.currentWeight) || 0;
    const density = parseFloat(formData.densitySpecificGravity) || null;

    // Calculate Container Weight based on unit type
    let containerWeight = 0;
    if (initialWeight > 0 && maxVolume > 0) {
      if (formData.unit === 'g') {
        // For mass units: Container Weight = Initial Weight - Max Volume
        containerWeight = initialWeight - maxVolume;
      } else if (formData.unit === 'mL' && density) {
        // For volume units: Container Weight = Initial Weight - (Max Volume × Density)
        containerWeight = initialWeight - maxVolume * density;
      }
    }

    // Calculate Mass of Contents: Current Weight - Container Weight
    const massOfContents = currentWeight > 0 ? currentWeight - containerWeight : maxVolume;

    return {
      Name: formData.name,
      CAS: formData.cas || '',
      'Storage Location': formData.storageLocation,
      Status: formData.status,
      Company: formData.company || '',
      'Product #': formData.productNumber || '',
      'Group #': formData.groupNumber || '',
      'Unit of Measurement': formData.unit,
      'Max Volume': {
        Mass: maxVolume,
      },
      'Percent Remaining': formData.percentRemaining || '100',
      // Additional fields that may be in the database
      Labeled: willPrintLabel ? 'Yes' : 'No',
      'Fill %': '',
      'Safety Data Sheet': formData.safetyDataSheet || '',
      'SDS in Date': '',
      'Container Type': 'Source Container',
      'Date Received': formData.dateReceived || now,
      Formula: '', // Will be set after creation when ID is available
      'QR Code': '',
      UUID: '',
      'Initial Weight (g)': initialWeight,
      'Container Weight': containerWeight,
      'Current Weight': currentWeight,
      'Date Opened': formData.status === 'Open' ? now : '',
      Density: {
        'Specific Gravity (g': {
          'mL)': density,
        },
      },
      'Mass of Contents (g)': massOfContents,
      Synonyms: formData.synonyms || '',
    };
  }
}

export const inventoryService = new InventoryService();
