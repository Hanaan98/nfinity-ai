// src/pages/SetupPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Spinner } from "../components/LoadingStates";
import { chatApi } from "../services/api";

const PAGE_BG = "bg-[#151a1e]";
const CARD_BG = "bg-[#1d2328]";
const BORDER = "border border-[#293239]";

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength validation
  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
    {
      text: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    const inviteToken = searchParams.get("token");

    if (!inviteToken) {
      setTokenValid(false);
      setValidatingToken(false);
      return;
    }

    // Validate token and get invitation details
    const validateToken = async () => {
      try {
        const response = await chatApi.validateInviteToken(inviteToken);

        if (response.invitation) {
          setToken(inviteToken);
          setEmail(response.invitation.email);
          setRole(response.invitation.role);
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        setTokenValid(false);
        setError(err.message || "Invalid or expired invitation link.");
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid || !passwordsMatch) {
      setError(
        "Please ensure all password requirements are met and passwords match."
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await chatApi.setupPassword(token, {
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setSuccess(true);

      // Redirect to login after a moment
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Account setup complete! You can now sign in with your new password.",
          },
        });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to set up password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div
        className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
      >
        <div
          className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
        >
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-200">
              Validating invitation...
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Please wait while we verify your invitation link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div
        className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
      >
        <div
          className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
        >
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              Invalid invitation
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              This invitation link is invalid or has expired. Please contact
              your administrator for a new invitation.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div
        className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
      >
        <div
          className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
        >
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              Welcome aboard!
            </h1>
            <p className="text-sm text-gray-400 mb-4">
              Your account has been set up successfully. Redirecting you to sign
              in...
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <Spinner size="sm" />
              <span className="text-sm">Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
    >
      <div
        className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/20 grid place-items-center shadow-lg">
            <span className="text-lg font-bold text-white">∞</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Set up your password
          </h1>
          <p className="text-sm text-gray-400 mb-4">
            Complete your account setup to get started
          </p>
          <div className="text-sm text-gray-300 bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-800/30">
            {email} • {role}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                First name
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full px-4 h-12 rounded-lg bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-4 h-12 rounded-lg bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Create password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 h-12 pr-12 rounded-lg bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password requirements */}
            {password && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-gray-700 border border-gray-600"
                      }`}
                    >
                      {req.met ? (
                        <svg
                          className="w-2.5 h-2.5 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={req.met ? "text-green-400" : "text-gray-400"}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full px-4 h-12 rounded-lg bg-[#151a1e] border text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 transition-all ${
                confirmPassword && !passwordsMatch
                  ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/40"
                  : "border-[#293239] focus:ring-blue-500/40 focus:border-blue-500/40"
              }`}
              placeholder="Confirm your password"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-xs text-red-400">
                Passwords do not match
              </p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Passwords match
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-300">
                  Setup failed
                </h4>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className={`w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Setting up account..." : "Complete setup"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-green-900/10 border border-green-800/30 rounded-lg">
          <div className="text-xs text-green-300">
            <div className="font-medium mb-1">🎉 You're almost there!</div>
            <p className="text-green-200">
              After setting up your password, you'll have full access to the
              admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
