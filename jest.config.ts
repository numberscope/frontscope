import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  moduleNameMapper: { '@/(.*)': '<rootDir>/src/$1', }
};

export default config;