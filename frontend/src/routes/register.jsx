import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — SummerNest" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthShell
      title="Join SummerNest."
      subtitle="Create an account for early drops and 10% off your first order."
      mode="register"
    />
  );
}

