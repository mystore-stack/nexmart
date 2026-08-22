// src/lib/guards/usage-limit.ts
export function checkUsageLimit(metric: string, quantity: number = 1) {
  return async ({ session }: { session: any }) => {
    const { LimitEnforcer } = await import('@/lib/saas/limit-enforcer');
    
    const check = await LimitEnforcer.checkLimit({
      organizationId: session.organizationId,
      metric,
      quantity,
    });
    
    if (!check.allowed) {
      throw new Error(`Usage limit exceeded for ${metric}`);
    }
    
    return true;
  };
}
