import { Loader } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
