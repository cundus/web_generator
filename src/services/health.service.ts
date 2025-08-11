import databaseService from "./database.service";

export async function getHealthStatus() {
  const healthStatus = {
    status: 'ok',
    message: 'Express + TypeScript is running',
    timestamp: new Date().toISOString(),
    database: '',
  };

  const dbConnection = await databaseService.testConnection();
  healthStatus.database = dbConnection ? 'ok' : 'unhealthy';

  return healthStatus;
}
