// Locations feature - Type definitions

export type LocationType =
  | 'room'
  | 'cabinet'
  | 'shelf'
  | 'fridge'
  | 'freezer'
  | 'hood'
  | 'bench'
  | 'drawer';

export type TemperatureType = 'ambient' | 'cold' | 'frozen';

export type VentilationType = 'standard' | 'fume_hood' | 'vented_cabinet';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parent_id: string | null; // null for top-level (rooms)

  // Environmental/Safety metadata
  temperature?: TemperatureType;
  ventilation?: VentilationType;
  restrictions?: string[]; // e.g., ['flammables_only', 'acids_only', 'no_oxidizers']

  // Optional fields
  notes?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Helper type for building the tree structure
export interface LocationNode extends Location {
  children: LocationNode[];
  full_path: string;
  depth: number;
}
