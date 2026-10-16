import Image from "next/image";
import { signOut } from "../actions";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const noAccess = error === "access";
  return (
    <main className="adm adm-login">
      <div className="adm-card adm-login__card">
        <Image src="/assets/logo-header.webp" alt="California Law" width={190} height={80} className="adm-login__logo" loading="eager" />
        <h1>Admin sign in</h1>
        <LoginForm next={next} notice={noAccess ? "This account doesn’t have admin access. Sign out and use an admin account." : undefined} />
        {noAccess && (
          <form action={signOut}>
            <button className="adm-btn adm-btn--ghost adm-btn--block">Sign out</button>
          </form>
        )}
        <p className="adm-muted adm-login__help">Forgot your password? Ask an administrator to reset it.</p>
      </div>
    </main>
  );
}
