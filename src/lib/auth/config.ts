// Auth configuration - Google OAuth setup placeholder
export const authConfig = {
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
