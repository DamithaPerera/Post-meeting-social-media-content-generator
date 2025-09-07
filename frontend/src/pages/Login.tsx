export default function Login() {
  return (
    <div className="max-w-md mx-auto mt-24 card space-y-4 text-center">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p>Use Google to sign in and load your calendars.</p>
      <a className="btn-primary justify-center" href={`${import.meta.env.VITE_API_BASE}/auth/google`}>Continue with Google</a>
    </div>
  );
}
