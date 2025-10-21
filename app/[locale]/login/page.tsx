"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { TextField, Button, Alert, CircularProgress } from "@mui/material";
import REGEX_PATTERNS from "../../constants/REGX";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/store/slicers/authThunks";
import { clearError } from "@/store/slicers/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { authService } from "@/services/auth-service";

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

  // Handle navigation after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (authService.isUserAdmin(user)) {
        console.log("✅ Login successful, redirecting to dashboard");
        router.replace("/dashboard");
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
    <div className="flex flex-col bg-[#e9ecef] h-screen w-screen items-center justify-center p-5">
      <span className="text-3xl font-normal text-green-700 mb-3 text-center">
        Silsila Idreesia
      </span>
      <div className="bg-white p-7 w-[320px] sm:w-[450px] rounded-lg shadow-lg">
        <h3 className="text-center mb-4 text-xl font-semibold">{t("login")}</h3>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-4">
            {error === "Invalid email or password"
              ? t("invalidCredentials")
              : error}
          </Alert>
        )}

        {/* Rate Limit Alert */}
        {rateLimitInfo?.limited && (
          <Alert severity="warning" className="mb-4">
            {`Too many login attempts. Please try again in ${rateLimitInfo.secondsRemaining} seconds.`}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("email")}
                  placeholder="e.g. abc@gmail.com"
                  variant="outlined"
                  margin="normal"
                  error={!!error}
                  helperText={error ? error?.message : ""}
                  disabled={isLoggingIn}
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("password")}
                  type="password"
                  placeholder="Enter your password"
                  variant="outlined"
                  margin="normal"
                  error={!!error}
                  helperText={error ? error.message : ""}
                  disabled={isLoggingIn}
                />
              )}
            />
            <br />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <Controller
                name="remember"
                control={control}
                render={({ field: { value, onChange, onBlur, name, ref } }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      disabled={isLoggingIn}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-600">
                      {t("rememberMe")}
                    </label>
                  </div>
                )}
              />
            </div>
            <div>
              <Button
                type="submit"
                variant="contained"
                className="bg-[#007bff] text-white hover:bg-[#0056b3] !normal-case"
                disabled={isLoggingIn || rateLimitInfo?.limited}
                startIcon={
                  isLoggingIn ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isLoggingIn ? "Signing In..." : t("signIn")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
