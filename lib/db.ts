import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

try {
    if (process.env.NODE_ENV === "production") {
        db = new PrismaClient({
            log: ['error'],
        });
    } else {
        if (!global.prisma) {
            global.prisma = new PrismaClient({
                log: ['error'],
            });
        }
        db = global.prisma;
    }
} catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    throw new Error('Database connection failed. Please ensure Prisma client is properly generated.');
}

export { db };