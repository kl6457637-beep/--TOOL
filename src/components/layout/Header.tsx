import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Amazon Ad Flow</h1>
            <p className="text-sm text-muted-foreground">亚马逊广告智能优化工具</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          MVP v1.0
        </div>
      </div>
    </header>
  );
}
