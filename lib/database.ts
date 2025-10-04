import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { createClient as createRedisClient } from 'redis';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// MongoDB connection
let mongoClient: MongoClient;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI!);
    await mongoClient.connect();
  }
  return mongoClient;
};

export const getMongoDb = async () => {
  const client = await getMongoClient();
  return client.db('nextboomcity');
};

// Redis connection
let redisClient: ReturnType<typeof createRedisClient>;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient({
      url: process.env.REDIS_URL,
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
  }
  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

// Health checks
export const checkDatabaseHealth = async () => {
  const results = {
    postgresql: false,
    mongodb: false,
    redis: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.postgresql = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    const client = await getMongoClient();
    await client.db().admin().ping();
    results.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    const client = await connectRedis();
    await client.ping();
    results.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return results;
};