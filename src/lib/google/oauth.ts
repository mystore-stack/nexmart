import { prisma } from "@/lib/prisma";
import { GoogleIntegrationService } from "./index";

export class GoogleOAuthService {
  static async linkAccount(
    userId: string,
    googleId: string,
    email: string,
    name: string | null,
    picture: string | null,
    accessToken: string,
    refreshToken: string | null,
    tokenExpiresAt: Date | null,
    scopes: string[]
  ) {
    const existingAccount = await prisma.googleOAuthAccount.findUnique({
      where: { googleId },
    });

    if (existingAccount) {
      return prisma.googleOAuthAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken,
          refreshToken,
          tokenExpiresAt,
          scopes,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.googleOAuthAccount.create({
      data: {
        userId,
        googleId,
        email,
        name,
        picture,
        accessToken,
        refreshToken,
        tokenExpiresAt,
        scopes,
      },
    });
  }

  static async unlinkAccount(userId: string) {
    await prisma.googleOAuthAccount.delete({
      where: { userId },
    });
  }

  static async getAccount(userId: string) {
    return prisma.googleOAuthAccount.findUnique({
      where: { userId },
    });
  }

  static async refreshAccessToken(accountId: string): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    try {
      const account = await prisma.googleOAuthAccount.findUnique({
        where: { id: accountId },
      });

      if (!account || !account.refreshToken) {
        return {
          success: false,
          error: "No refresh token available",
        };
      }

      return {
        success: false,
        error: "Token refresh not implemented - requires Google OAuth client",
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: "Failed to refresh token",
      };
    }
  }

  static async isTokenExpired(accountId: string): Promise<boolean> {
    const account = await prisma.googleOAuthAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.tokenExpiresAt) {
      return true;
    }

    return new Date() > account.tokenExpiresAt;
  }

  static async getLinkedAccounts(userId: string) {
    return prisma.googleOAuthAccount.findMany({
      where: { userId },
    });
  }

  static async revokeAccess(accountId: string) {
    await prisma.googleOAuthAccount.delete({
      where: { id: accountId },
    });
  }
}
