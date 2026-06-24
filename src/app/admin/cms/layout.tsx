import { CmsShell } from "@/components/admin/cms/shell/CmsShell";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <div className="-m-4 sm:-m-6">{children}</div>;
}

export { CmsShell };
