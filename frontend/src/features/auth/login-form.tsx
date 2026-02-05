import { type ComponentProps, type FormEvent } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

type LoginFormProps = Omit<ComponentProps<"div">, "onSubmit"> & {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  submitLabel: string
  disabled?: boolean
  submitDisabled?: boolean
  errorMessage?: string | null
  onSwitchToSignup: () => void
  demoAccount?: {
    label: string
    email: string
    password: string
  }
  onDemoLogin?: (account: { label: string; email: string; password: string }) => void
}

export function LoginForm({
  className,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitLabel,
  disabled = false,
  submitDisabled = false,
  errorMessage,
  onSwitchToSignup,
  demoAccount,
  onDemoLogin,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6 text-foreground", className)} {...props}>
      <Card className="shadow-none">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-sm">
            Sign in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <FieldGroup>
              {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={submitDisabled || disabled}
                >
                  {submitLabel}
                </Button>
                <FieldDescription className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="underline-offset-4 hover:underline text-primary"
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          {demoAccount ? (
            <div className="mt-6 border-t border-border/70 pt-5">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Тестовый аккаунт
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                <div className="text-sm">
                  <div className="font-medium">{demoAccount.label}</div>
                  <div className="text-xs text-muted-foreground">{demoAccount.email}</div>
                </div>
                <Button
                  type="button"
                  onClick={() => onDemoLogin?.(demoAccount)}
                  disabled={disabled}
                >
                  Войти
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
