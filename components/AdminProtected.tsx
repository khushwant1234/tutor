// components/AdminProtected.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function AdminProtected({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading, refresh } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      setChecking(true);

      // Force refresh session to ensure we have latest auth state
      await refresh();

      // If not logged in, redirect to login
      if (!user && !isLoading) {
        router.push("/login");
        return;
      }

      // Check admin status (isAdmin is already computed by AuthProvider)
      if (user && isAdmin === false) {
        router.push("/");
        return;
      }

      setChecking(false);
    };

    checkAuthentication();
  }, [user, isLoading, isAdmin, refresh, router]);

  if (isLoading || checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
