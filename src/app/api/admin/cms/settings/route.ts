import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { getSiteSettings } from "@/lib/cms/data";
import { updateSiteSettings } from "@/lib/cms/actions/settings";

export async function GET() {
  try {
    await requireCmsPermission(CmsPermission.CMS_VIEW);
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await updateSiteSettings(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
