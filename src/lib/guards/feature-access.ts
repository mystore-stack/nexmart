// src/lib/guards/feature-access.ts
export function requireFeature(featureKey: string) {
  return async ({ session }: { session: any }) => {
    const { FeatureFlagService } = await import('@/lib/saas/feature-flag-service');
    
    const isEnabled = await FeatureFlagService.isEnabled(
      featureKey,
      session.organizationId
    );
    
    if (!isEnabled) {
      throw new Error(`Feature ${featureKey} not available`);
    }
    
    return true;
  };
}
