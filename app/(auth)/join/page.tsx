import { redirect } from "next/navigation";
import { auth, signIn } from "../../../auth";

export default async function JoinPage() {
  const session = await auth();

  if (session?.user?.status === "ACTIVE") {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect("/apply");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="section-label">Join ShardUp</p>
        <h1>Start with your Google account.</h1>
        <p>
          Signing in creates your ShardUp identity. Full member access is granted
          after your application is reviewed.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button className="button" type="submit">
            Continue with Google
          </button>
        </form>
      </section>
    </main>
  );
}
