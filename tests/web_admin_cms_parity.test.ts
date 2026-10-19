import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { GET as getMobileSections, POST as postMobileSection, PUT as putMobileSection, DELETE as deleteMobileSection } from '../src/app/api/admin/cms/mobile-app/route';
import { GET as getGlobalSettings, PUT as putGlobalSettings } from '../src/app/api/admin/cms/mobile-app/settings/route';
import { POST as publishCms } from '../src/app/api/admin/cms/mobile-app/publish/route';
import { GET as getRevisions, POST as postRevision } from '../src/app/api/admin/cms/mobile-app/revisions/route';
import { GET as getMobileHomeFeed } from '../src/app/api/cms/mobile/home/route';
import { SECTION_REGISTRY } from '../src/components/admin/mobile-cms/AddSectionModal';
import { prisma } from '../src/lib/prisma';

// Setup test environment auth session
process.env.NODE_ENV = 'test';
(globalThis as any).__TEST_ADMIN_SESSION__ = {
  role: 'SUPER_ADMIN',
  userId: 'user-super-admin-01',
  email: 'superadmin@nexmart.ma',
  organizationId: 'org-nexmart-main',
};

test('1. Section Registry contains all 17 registered section types with required metadata', () => {
  assert.equal(SECTION_REGISTRY.length, 17, 'Registry must contain 17 section types');
  const expectedTypes = [
    'hero', 'custom-banner', 'discover', 'products', 'flash', 'grouped-offers',
    'categories', 'brands', 'gift', 'offers', 'coupons', 'smart-journey',
    'nexplay', 'welcome-offer', 'gift-quest', 'announcement-popup', 'personal'
  ];
  const registeredTypes = SECTION_REGISTRY.map((s) => s.type);
  for (const expected of expectedTypes) {
    assert.ok(registeredTypes.includes(expected), `Section type ${expected} must be registered`);
  }
});

test('2. Super Admin can add a section instance from registry with unique key and default config', async () => {
  const delegate = prisma.mobileAppSection as any;
  const originalCreate = delegate.create;
  const originalFindUnique = delegate.findUnique;
  const originalFindFirst = delegate.findFirst;

  let createdPayload: any = null;
  delegate.findUnique = async () => null;
  delegate.findFirst = async () => ({ order: 5 });
  delegate.create = async ({ data }: any) => {
    createdPayload = data;
    return { id: 'sec-uuid-test-01', ...data, createdAt: new Date(), updatedAt: new Date() };
  };

  try {
    const registryItem = SECTION_REGISTRY.find((s) => s.type === 'custom-banner')!;
    const req = new NextRequest('http://localhost/api/admin/cms/mobile-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionKey: `sec_custom_banner_${Date.now()}`,
        type: registryItem.type,
        titleFr: registryItem.name,
        titleAr: registryItem.nameAr,
        layoutType: registryItem.defaultLayout,
        order: 6,
        active: true,
        config: registryItem.defaultConfig,
      }),
    });

    const res = await postMobileSection(req);
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    assert.equal(createdPayload.type, 'custom-banner');
    assert.equal(createdPayload.titleFr, 'Bannière Personnalisée & CTA');
    assert.equal(createdPayload.config.backgroundColor, '#1B4332');
    assert.equal(createdPayload.config.accentColor, '#D4AF37');
  } finally {
    delegate.create = originalCreate;
    delegate.findUnique = originalFindUnique;
    delegate.findFirst = originalFindFirst;
  }
});

test('3. Duplicating a section generates an independent clone with unique key and new order', async () => {
  const delegate = prisma.mobileAppSection as any;
  const originalCreate = delegate.create;
  const originalFindUnique = delegate.findUnique;

  let createdKey = '';
  delegate.findUnique = async () => ({ id: 'existing-id' }); // Simulate existing key
  delegate.create = async ({ data }: any) => {
    createdKey = data.sectionKey;
    return { id: 'cloned-uuid', ...data };
  };

  try {
    const req = new NextRequest('http://localhost/api/admin/cms/mobile-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'duplicate',
        sectionKey: 'sec_products_original',
        type: 'products',
        titleFr: 'Produits (copie)',
        layoutType: 'grid',
        order: 10,
        active: true,
        config: { limit: 8 },
      }),
    });

    const res = await postMobileSection(req);
    assert.equal(res.status, 201);
    assert.ok(createdKey.startsWith('sec_products_original_'), 'Duplicate must auto-suffix unique key to avoid collision');
  } finally {
    delegate.create = originalCreate;
    delegate.findUnique = originalFindUnique;
  }
});

test('4. Batch saving modified sections via PUT transaction succeeds', async () => {
  const delegate = prisma.mobileAppSection as any;
  const originalTransaction = prisma.$transaction;
  const originalFindMany = delegate.findMany;

  let updatedCount = 0;
  (prisma as any).$transaction = async (promises: any[]) => {
    updatedCount = promises.length;
    return promises;
  };
  delegate.findMany = async () => [
    { id: 'sec-1', titleFr: 'Hero Updated', order: 1 },
    { id: 'sec-2', titleFr: 'Flash Updated', order: 2 },
  ];

  try {
    const req = new NextRequest('http://localhost/api/admin/cms/mobile-app', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: [
          { id: '00000000-0000-0000-0000-000000000001', titleFr: 'Hero Updated', order: 1 },
          { id: '00000000-0000-0000-0000-000000000002', titleFr: 'Flash Updated', order: 2 },
        ],
      }),
    });

    const res = await putMobileSection(req);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(updatedCount, 2, 'Both sections must be updated in a transaction');
  } finally {
    (prisma as any).$transaction = originalTransaction;
    delegate.findMany = originalFindMany;
  }
});

test('5. Global Presentation Settings: GET returns Moroccan Luxury defaults and PUT persists tokens', async () => {
  const delegate = prisma.mobileAppSection as any;
  const originalFindUnique = delegate.findUnique;
  const originalUpsert = delegate.upsert;

  let persistedConfig: any = null;
  delegate.findUnique = async () => null;
  delegate.upsert = async ({ update }: any) => {
    persistedConfig = update.config;
    return { sectionKey: 'global_settings', config: persistedConfig };
  };

  try {
    // GET
    const getReq = new NextRequest('http://localhost/api/admin/cms/mobile-app/settings');
    const getRes = await getGlobalSettings(getReq);
    const getBody = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.ok(getBody.data.colors.primary, 'Primary color must exist');
    assert.ok(getBody.data.radius.md, 'Radius scale must exist');

    // PUT
    const putReq = new NextRequest('http://localhost/api/admin/cms/mobile-app/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        colors: { primary: '#0A3622', gold: '#C5A059' },
        typography: { appName: 'NexMart Luxury' },
      }),
    });
    const putRes = await putGlobalSettings(putReq);
    const putBody = await putRes.json();
    assert.equal(putRes.status, 200);
    assert.equal(putBody.success, true);
    assert.equal(persistedConfig.colors.primary, '#0A3622');
    assert.equal(persistedConfig.colors.gold, '#C5A059');
    assert.equal(persistedConfig.typography.appName, 'NexMart Luxury');
  } finally {
    delegate.findUnique = originalFindUnique;
    delegate.upsert = originalUpsert;
  }
});

test('6. Publishing creates an immutable revision snapshot and records active count', async () => {
  const delegateSection = prisma.mobileAppSection as any;
  const delegateAudit = prisma.auditLog as any;
  const originalFindMany = delegateSection.findMany;
  const originalAuditCreate = delegateAudit.create;

  let loggedSnapshot: any = null;
  delegateSection.findMany = async () => [
    { id: 's1', active: true, titleFr: 'Sec 1' },
    { id: 's2', active: false, titleFr: 'Sec 2' },
  ];
  delegateAudit.create = async ({ data }: any) => {
    loggedSnapshot = data;
    return { id: 'snapshot-log-uuid-123' };
  };

  try {
    const req = new NextRequest('http://localhost/api/admin/cms/mobile-app/publish', {
      method: 'POST',
    });
    const res = await publishCms(req);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.activeSections, 1);
    assert.equal(body.totalSections, 2);
    assert.equal(loggedSnapshot.action, 'MOBILE_CMS_PUBLISH');
    assert.equal(loggedSnapshot.metadata.activeCount, 1);
    assert.equal(loggedSnapshot.metadata.author, 'superadmin@nexmart.ma');
  } finally {
    delegateSection.findMany = originalFindMany;
    delegateAudit.create = originalAuditCreate;
  }
});

test('7. Revisions History: GET lists snapshots and POST restores snapshot atomically', async () => {
  const delegateAudit = prisma.auditLog as any;
  const delegateSection = prisma.mobileAppSection as any;
  const originalAuditFindMany = delegateAudit.findMany;
  const originalAuditFindUnique = delegateAudit.findUnique;
  const originalTransaction = prisma.$transaction;

  delegateAudit.findMany = async () => [
    {
      id: 'rev-01',
      action: 'MOBILE_CMS_PUBLISH',
      createdAt: new Date('2026-10-19T20:00:00.000Z'),
      metadata: { description: 'Version 1.0', author: 'superadmin@nexmart.ma', sections: [{ id: 's1' }] },
    },
  ];

  let restoredExecuted = false;
  delegateAudit.findUnique = async () => ({
    id: 'rev-01',
    metadata: {
      sections: [{ sectionKey: 'heroCarousel', titleFr: 'Hero', order: 1, active: true }],
    },
  });
  (prisma as any).$transaction = async (fn: any) => {
    restoredExecuted = true;
    return fn({
      mobileAppSection: {
        deleteMany: async () => {},
        create: async () => {},
      },
      auditLog: {
        create: async () => {},
      },
    });
  };

  try {
    // GET revisions
    const getReq = new NextRequest('http://localhost/api/admin/cms/mobile-app/revisions');
    const getRes = await getRevisions(getReq);
    const getBody = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getBody.data.length, 1);
    assert.equal(getBody.data[0].id, 'rev-01');

    // POST restore
    const postReq = new NextRequest('http://localhost/api/admin/cms/mobile-app/revisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', revisionId: 'rev-01' }),
    });
    const postRes = await postRevision(postReq);
    const postBody = await postRes.json();
    assert.equal(postRes.status, 200);
    assert.equal(postBody.success, true);
    assert.ok(restoredExecuted, 'Transaction must execute rollback restore');
  } finally {
    delegateAudit.findMany = originalAuditFindMany;
    delegateAudit.findUnique = originalAuditFindUnique;
    (prisma as any).$transaction = originalTransaction;
  }
});

test('8. Mobile Home Feed delivers custom-banner and design tokens to Expo mobile app', async () => {
  const delegateSection = prisma.mobileAppSection as any;
  const delegateHero = prisma.heroSlide as any;
  const delegateBrand = prisma.brand as any;
  const originalFindManySection = delegateSection.findMany;
  const originalFindUniqueSection = delegateSection.findUnique;
  const originalFindManyHero = delegateHero.findMany;
  const originalFindManyBrand = delegateBrand.findMany;

  delegateSection.findMany = async () => [
    {
      id: 'banner-sec-1',
      sectionKey: 'sec_custom_banner_1',
      type: 'custom-banner',
      titleFr: 'Promotion Exclusivité',
      titleAr: 'عرض خاص',
      subtitleFr: 'Jusqu’à -50%',
      subtitleAr: null,
      order: 1,
      active: true,
      layoutType: 'banner',
      bannerImage: 'https://cdn.nexmart.ma/banner.jpg',
      config: {
        ctaLabel: 'Profiter',
        ctaAction: 'SHOP',
        backgroundColor: '#1B4332',
        textColor: '#FFFFFF',
        accentColor: '#D4AF37',
      },
      productIds: [],
      categoryIds: [],
      brandIds: [],
      startAt: null,
      endAt: null,
      updatedAt: new Date(),
    },
  ];
  delegateSection.findUnique = async () => ({
    sectionKey: 'global_settings',
    config: { colors: { primary: '#1B4332', gold: '#D4AF37' } },
  });
  delegateHero.findMany = async () => [];
  delegateBrand.findMany = async () => [];

  try {
    const res = await getMobileHomeFeed();
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.sections.length, 1);
    assert.equal(body.sections[0].type, 'custom-banner');
    assert.equal(body.sections[0].ctaLabel, 'Profiter');
    assert.equal(body.sections[0].backgroundColor, '#1B4332');
    assert.equal(body.sections[0].accentColor, '#D4AF37');
    assert.equal(body.settings.colors.primary, '#1B4332');
  } finally {
    delegateSection.findMany = originalFindManySection;
    delegateSection.findUnique = originalFindUniqueSection;
    delegateHero.findMany = originalFindManyHero;
    delegateBrand.findMany = originalFindManyBrand;
  }
});
