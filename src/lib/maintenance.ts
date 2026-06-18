// In-memory maintenance mode flag (shared across middleware + API in same process)
let maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

export function isMaintenanceMode(): boolean {
  return maintenanceMode;
}

export function setMaintenanceMode(enabled: boolean): void {
  maintenanceMode = enabled;
}
