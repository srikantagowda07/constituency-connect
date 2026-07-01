import { APP_NAME, APP_DESCRIPTION } from "@/constants/app";

/**
 * Root page stub.
 * Replace this with the landing page or redirect logic once the UI is built.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
      <p className="text-muted-foreground max-w-md">{APP_DESCRIPTION}</p>
    </main>
  );
}
