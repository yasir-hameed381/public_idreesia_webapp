"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import REGEX_PATTERNS from "../../constants/REGX";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/store/slicers/authThunks";
import { clearError } from "@/store/slicers/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { authService } from "@/services/auth-service";
import UrduIdreesiaLogo from "../../assets/logo1.png";
import Image from "next/image";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required")
      .matches(REGEX_PATTERNS.EMAIL, "Please enter a valid email"),
    password: yup
      .string()
      .required("Password is required")
      .min(1, "Password is required"),
    remember: yup.boolean().oneOf([true, false]).default(false),
  })
  .required();

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const t = useTranslations("auth");
  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggingIn, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    limited: boolean;
    secondsRemaining?: number;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Handle navigation after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (authService.isUserAdmin(user)) {
        console.log("✅ Login successful, redirecting to dashboard");
        router.replace("/");
      } else {
        console.log("✅ Login successful, redirecting to home");
        router.replace("/");
      }
    } else if (isAuthenticated && !user) {
      // User is authenticated but no user data, redirect to home
      console.log("✅ User authenticated, redirecting to home");
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  // Clear error when user starts typing
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && error) {
        dispatch(clearError());
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, error, dispatch]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    try {
      // Check rate limiting before attempting login
      const rateLimitCheck = authService.getRateLimitInfo(formData.email);
      if (rateLimitCheck.limited) {
        setRateLimitInfo(rateLimitCheck);
        setError("email", {
          type: "manual",
          message: `Too many login attempts. Please try again in ${rateLimitCheck.secondsRemaining} seconds.`,
        });
        return;
      }

      // Clear any previous rate limit info and form errors
      setRateLimitInfo(null);
      clearErrors();

      // Attempt login
      await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        })
      ).unwrap();
    } catch (error: any) {
      // Handle specific error types
      if (error.includes("Too many login attempts")) {
        const rateLimitCheck = authService.getRateLimitInfo(formData.email);
        setRateLimitInfo(rateLimitCheck);
        setError("email", {
          type: "manual",
          message: error,
        });
      } else {
        // For all authentication errors (wrong email, wrong password, user not found, etc.)
        // Don't set field-specific errors, let the Redux error state handle it
        // The error will be displayed in the Alert component above the form
        console.log("Authentication error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl px-8 pb-8 sm:px-10 pt-5">
          <div className="flex flex-col items-center mb-4">
          <Image width={100} height={50} src={UrduIdreesiaLogo} alt="Logo" />
        </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Log in to your account
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Enter your email and password below to log in
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                {error === "Invalid email or password"
                  ? t("invalidCredentials")
                  : error}
              </p>
            </div>
          )}

          {/* Rate Limit Alert */}
          {rateLimitInfo?.limited && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Too many login attempts. Please try again in{" "}
                {rateLimitInfo.secondsRemaining} seconds.
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email address
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      disabled={isLoggingIn}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        error
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <div className="relative">
                      <input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        disabled={isLoggingIn}
                        className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                          error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                        } focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoggingIn}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <Controller
                name="remember"
                control={control}
                render={({ field: { value, onChange, onBlur, name, ref } }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      disabled={isLoggingIn}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-sm text-gray-700 select-none"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn || rateLimitInfo?.limited}
              className="w-full bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
