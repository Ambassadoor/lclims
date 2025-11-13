import { LocationNode, LocationType, TemperatureType, VentilationType } from '../types';

export interface LocationFormData {
  name: string;
  type: LocationType;
  parent_id: string | null;
  temperature?: TemperatureType;
  ventilation?: VentilationType;
  restrictions: string[];
  notes: string;
  is_active: boolean;
}

/**
 * Get initial form data based on context (editing existing, adding child, or new root)
 */
export const getInitialFormData = (
  location?: LocationNode | null,
  parentLocation?: LocationNode | null
): LocationFormData => {
  if (location) {
    return {
      name: location.name,
      type: location.type,
      parent_id: location.parent_id,
      temperature: location.temperature || 'ambient',
      ventilation: location.ventilation || 'standard',
      restrictions: location.restrictions || [],
      notes: location.notes || '',
      is_active: location.is_active,
    };
  }

  if (parentLocation) {
    return {
      name: '',
      type: 'cabinet',
      parent_id: parentLocation.id,
      temperature: parentLocation.temperature || 'ambient',
      ventilation: parentLocation.ventilation || 'standard',
      restrictions: [],
      notes: '',
      is_active: true,
    };
  }

  return {
    name: '',
    type: 'room',
    parent_id: null,
    temperature: 'ambient',
    ventilation: 'standard',
    restrictions: [],
    notes: '',
    is_active: true,
  };
};
