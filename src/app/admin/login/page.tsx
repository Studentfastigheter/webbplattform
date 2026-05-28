import { LoginForm } from "@/components/ui/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#f6f7f6] p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm mode="admin" />
      </div>
    </main>
  );
}
