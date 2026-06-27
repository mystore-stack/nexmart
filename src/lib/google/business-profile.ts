import { prisma } from "@/lib/prisma";

export class GoogleBusinessProfileService {
  static async addProfile(
    organizationId: string,
    placeId: string,
    name: string,
    address?: string,
    phone?: string,
    website?: string,
    categories?: string[]
  ) {
    return prisma.googleBusinessProfile.create({
      data: {
        organizationId,
        placeId,
        name,
        address,
        phone,
        website,
        categories: categories || [],
      },
    });
  }

  static async syncProfile(profileId: string) {
    try {
      const profile = await prisma.googleBusinessProfile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      await prisma.googleBusinessProfile.update({
        where: { id: profileId },
        data: {
          verified: true,
          lastSyncAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Profile sync error:", error);
      return { success: false, error: "Failed to sync profile" };
    }
  }

  static async updateProfile(
    profileId: string,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      website?: string;
      categories?: string[];
    }
  ) {
    return prisma.googleBusinessProfile.update({
      where: { id: profileId },
      data,
    });
  }

  static async getProfiles(organizationId: string) {
    return prisma.googleBusinessProfile.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async deleteProfile(profileId: string) {
    await prisma.googleBusinessProfile.delete({
      where: { id: profileId },
    });
  }

  static async verifyProfile(profileId: string) {
    await prisma.googleBusinessProfile.update({
      where: { id: profileId },
      data: { verified: true },
    });
  }

  static async getProfileStats(organizationId: string) {
    const profiles = await this.getProfiles(organizationId);

    const verifiedCount = profiles.filter((p) => p.verified).length;
    const totalRating = profiles.reduce((sum, p) => sum + (p.rating || 0), 0);
    const avgRating = verifiedCount > 0 ? totalRating / verifiedCount : 0;
    const totalReviews = profiles.reduce((sum, p) => sum + (p.reviewCount || 0), 0);

    return {
      totalProfiles: profiles.length,
      verifiedProfiles: verifiedCount,
      averageRating: avgRating,
      totalReviews,
    };
  }
}
