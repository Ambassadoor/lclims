import { LocationNode, LocationType, TemperatureType } from '../types';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScienceIcon from '@mui/icons-material/Science';

/**
 * Get the appropriate icon for a location type
 */
export const getLocationIcon = (type: LocationType) => {
  switch (type) {
    case 'room':
      return <MeetingRoomIcon fontSize="small" />;
    case 'fridge':
      return <KitchenIcon fontSize="small" />;
    case 'freezer':
      return <AcUnitIcon fontSize="small" />;
    case 'cabinet':
    case 'shelf':
    case 'drawer':
      return <DashboardIcon fontSize="small" />;
    case 'hood':
    case 'bench':
      return <ScienceIcon fontSize="small" />;
    default:
      return <DashboardIcon fontSize="small" />;
  }
};

/**
 * Get the chip color based on temperature
 */
export const getTemperatureColor = (
  temperature?: TemperatureType
): 'default' | 'info' | 'primary' => {
  switch (temperature) {
    case 'cold':
      return 'info';
    case 'frozen':
      return 'primary';
    default:
      return 'default';
  }
};
