import { logger } from 'src/logger';

const cache = {};

const getEnvVarOrDie = (variableName: string, defaultValue?: any) => {
  if (!(variableName in process.env)) {
    if (defaultValue) return defaultValue;
    logger.error(`Cannot find ${variableName} in environment variables. Died.`);
    process.exit(1);
  }

  if (cache[variableName]) return cache[variableName];

  cache[variableName] = process.env[variableName];

  return process.env[variableName];
};

export default getEnvVarOrDie;
