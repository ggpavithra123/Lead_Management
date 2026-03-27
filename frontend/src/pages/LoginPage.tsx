import { Navigate, useLocation } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/clerk-react";

export const LoginPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation() as {
    state?: { from?: { pathname?: string } };
  };
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  if (isLoaded && isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-800">
          Admin Login
        </h1>
        <p className="mb-4 text-xs text-slate-500">
          Sign in to manage leads, follow-ups, documents and conversions.
        </p>
        <SignIn
          routing="path"
          path="/login"
          forceRedirectUrl={redirectTo}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none border-0 p-0",
            },
          }}
        />
      </div>
    </div>
  );
};
