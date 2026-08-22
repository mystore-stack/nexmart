import { prisma } from "@/lib/prisma";

export async function createHomepageVersion(
  homepageBuilderId: string,
  sections: any[],
  createdBy: string,
  isAutoSave: boolean = false
) {
  try {
    const currentVersion = await prisma.homepageVersion.findFirst({
      where: { homepageBuilderId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = currentVersion ? currentVersion.versionNumber + 1 : 1;

    const version = await prisma.homepageVersion.create({
      data: {
        homepageBuilderId,
        versionNumber: nextVersionNumber,
        sections,
        createdBy,
        isAutoSave,
        status: isAutoSave ? "DRAFT" : "PUBLISHED",
        changeLog: isAutoSave ? "Auto-save" : "Manual save",
      },
    });

    return version;
  } catch (error) {
    console.error("Error creating homepage version:", error);
    throw error;
  }
}

export async function getHomepageVersions(homepageBuilderId: string) {
  try {
    const versions = await prisma.homepageVersion.findMany({
      where: { homepageBuilderId },
      orderBy: { versionNumber: "desc" },
      take: 50,
    });

    return versions;
  } catch (error) {
    console.error("Error fetching homepage versions:", error);
    throw error;
  }
}

export async function restoreHomepageVersion(versionId: string, userId: string) {
  try {
    const version = await prisma.homepageVersion.findUnique({
      where: { id: versionId },
      include: { homepageBuilder: true },
    });

    if (!version) {
      throw new Error("Version not found");
    }

    // Create a new version before restoring (for rollback capability)
    await createHomepageVersion(
      version.homepageBuilderId,
      version.homepageBuilder.sections as any,
      userId,
      false
    );

    // Restore the sections from the selected version
    await prisma.homepageSection.deleteMany({
      where: { builderId: version.homepageBuilderId },
    });

    // Recreate sections from the version
    for (const section of version.sections as any[]) {
      await prisma.homepageSection.create({
        data: {
          builderId: version.homepageBuilderId,
          sectionType: section.sectionType,
          isEnabled: section.isEnabled,
          displayOrder: section.displayOrder,
          config: section.config,
          visibility: section.visibility,
          publishStatus: section.publishStatus,
          translations: section.translations,
          analyticsEnabled: section.analyticsEnabled,
        },
      });
    }

    // Update builder status
    await prisma.homepageBuilder.update({
      where: { id: version.homepageBuilderId },
      data: {
        version: version.versionNumber,
        updatedAt: new Date(),
      },
    });

    return version;
  } catch (error) {
    console.error("Error restoring homepage version:", error);
    throw error;
  }
}

export async function publishHomepageVersion(
  versionId: string,
  userId: string
) {
  try {
    const version = await prisma.homepageVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error("Version not found");
    }

    // Update version status to published
    await prisma.homepageVersion.update({
      where: { id: versionId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedBy: userId,
      },
    });

    // Update homepage builder to use this version
    await prisma.homepageBuilder.update({
      where: { id: version.homepageBuilderId },
      data: {
        version: version.versionNumber,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return version;
  } catch (error) {
    console.error("Error publishing homepage version:", error);
    throw error;
  }
}

export async function compareVersions(versionId1: string, versionId2: string) {
  try {
    const [version1, version2] = await Promise.all([
      prisma.homepageVersion.findUnique({
        where: { id: versionId1 },
      }),
      prisma.homepageVersion.findUnique({
        where: { id: versionId2 },
      }),
    ]);

    if (!version1 || !version2) {
      throw new Error("One or both versions not found");
    }

    const sections1 = version1.sections as any[];
    const sections2 = version2.sections as any[];

    const changes = {
      added: [] as any[],
      removed: [] as any[],
      modified: [] as any[],
    };

    // Find added sections
    const sectionIds2 = new Set(sections2.map((s) => s.id));
    changes.added = sections1.filter((s) => !sectionIds2.has(s.id));

    // Find removed sections
    const sectionIds1 = new Set(sections1.map((s) => s.id));
    changes.removed = sections2.filter((s) => !sectionIds1.has(s.id));

    // Find modified sections
    for (const section1 of sections1) {
      const section2 = sections2.find((s) => s.id === section1.id);
      if (section2) {
        const isModified = JSON.stringify(section1) !== JSON.stringify(section2);
        if (isModified) {
          changes.modified.push({
            id: section1.id,
            sectionType: section1.sectionType,
            before: section1,
            after: section2,
          });
        }
      }
    }

    return {
      version1,
      version2,
      changes,
    };
  } catch (error) {
    console.error("Error comparing versions:", error);
    throw error;
  }
}

export async function deleteVersion(versionId: string) {
  try {
    await prisma.homepageVersion.delete({
      where: { id: versionId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting version:", error);
    throw error;
  }
}

export async function cleanupOldVersions(homepageBuilderId: string, keepCount: number = 10) {
  try {
    const versions = await prisma.homepageVersion.findMany({
      where: { homepageBuilderId },
      orderBy: { versionNumber: "desc" },
    });

    if (versions.length <= keepCount) {
      return { deleted: 0 };
    }

    const versionsToDelete = versions.slice(keepCount);
    const deletedCount = versionsToDelete.length;

    await prisma.homepageVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map((v) => v.id) },
      },
    });

    return { deleted: deletedCount };
  } catch (error) {
    console.error("Error cleaning up old versions:", error);
    throw error;
  }
}
