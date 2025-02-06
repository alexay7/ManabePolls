import dotenv from "dotenv";

dotenv.config();

const {
    MONGO_URI,
    GACHA_MONGO_URI,
    PORT,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    SESSION_SECRET,
    FRONTEND_URL,
    ADMIN_ID,
    DISCORD_WEBHOOK_URL,
    TICKETS_API_URL
} = process.env;

if (!MONGO_URI || !GACHA_MONGO_URI || !PORT || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !SESSION_SECRET || !FRONTEND_URL || !ADMIN_ID || !DISCORD_WEBHOOK_URL || !TICKETS_API_URL) {
    throw new Error("Missing environment variables");
}

export const config = {
    MONGO_URI,
    GACHA_MONGO_URI,
    PORT,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    SESSION_SECRET,
    FRONTEND_URL,
    ADMIN_ID,
    DISCORD_WEBHOOK_URL,
    TICKETS_API_URL
};