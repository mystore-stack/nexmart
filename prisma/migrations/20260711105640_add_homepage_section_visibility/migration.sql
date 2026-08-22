-- CreateTable
CREATE TABLE "HomepageSectionVisibility" (
    "id" UUID NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSectionVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSectionVisibility_sectionKey_key" ON "HomepageSectionVisibility"("sectionKey");

-- CreateIndex
CREATE INDEX "HomepageSectionVisibility_sectionKey_idx" ON "HomepageSectionVisibility"("sectionKey");

-- CreateIndex
CREATE INDEX "HomepageSectionVisibility_displayOrder_idx" ON "HomepageSectionVisibility"("displayOrder");
