const { z } = require('zod');

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1).optional(),
  BOT_OWNER_ID: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEFAULT_TIMEZONE: z.string().default('Europe/Berlin'),
  FONT_PATHS: z.string().optional(),
  PRIMARY_FONT_FAMILY: z.string().optional()
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const reason = parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join(' | ');
    throw new Error(`Invalid environment: ${reason}`);
  }
  return parsed.data;
}

module.exports = { loadEnv };
