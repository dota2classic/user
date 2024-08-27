require('dotenv').config();


export const REDIS_URL = () => process.env.REDIS_URL || 'redis://localhost:6379';

export const REDIS_HOST = () => process.env.REDIS_HOST || 'redis'
export const REDIS_PASSWORD = () => process.env.REDIS_PASSWORD || undefined;

export const DB_USERNAME = () => process.env.POSTGRES_USERNAME
export const DB_PASSWORD = () => process.env.POSTGRES_PASSWORD
export const DB_HOST = () => process.env.POSTGRES_HOST


export const STEAM_KEY = () => process.env.STEAM_KEY

export const profile = process.env.PROFILE;
export const isProd = profile === 'prod';
export const isDev = !isProd;

export const IS_SCALE_NODE = process.env.SCALET === 'true'


export const HOST_PORT = process.env.USER_PORT
