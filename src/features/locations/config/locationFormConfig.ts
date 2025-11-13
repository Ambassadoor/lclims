import { LocationType, TemperatureType, VentilationType } from '../types';

export const LOCATION_TYPES: LocationType[] = [
  'room',
  'cabinet',
  'shelf',
  'fridge',
  'freezer',
  'hood',
  'bench',
  'drawer',
];

export const TEMPERATURE_TYPES: TemperatureType[] = ['ambient', 'cold', 'frozen'];

export const VENTILATION_TYPES: VentilationType[] = ['standard', 'fume_hood', 'vented_cabinet'];

export const RESTRICTION_OPTIONS = [
  'flammables_only',
  'acids_only',
  'bases_only',
  'no_oxidizers',
  'no_water_reactive',
  'high_hazard',
];
