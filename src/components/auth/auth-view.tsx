'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authApi } from '@/services/api'
import { loginSchema, registerSchema } from '@/lib/validations'
import { useAppStore } from '@/store/app-store'

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export function AuthView() {
  const setUser = useAppStore((s) => s.setUser)
  const [tab, setTab] = useState<'login' | 'register'>('login')

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  async function onLogin(values: LoginValues) {
    setLoginLoading(true)
    try {
      const { user } = await authApi.login(values)
      setUser(user)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  async function onRegister(values: RegisterValues) {
    setRegisterLoading(true)
    try {
      const { user } = await authApi.register(values)
      setUser(user)
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`)
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left hero / marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Smart Expense Tracker</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Take control of your money, one transaction at a time.
          </h1>
          <p className="text-emerald-50">
            Track income, expenses, savings and budgets with beautiful charts,
            smart alerts and instant PDF / Excel exports.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <Feature icon={TrendingUp} title="Track Income" desc="Salary, freelance & more" />
            <Feature icon={TrendingDown} title="Track Expenses" desc="11 categories" />
            <Feature icon={PieChart} title="Visual Charts" desc="Pie, Bar & Line" />
            <Feature icon={Wallet} title="Budget Alerts" desc="80% / 90% / 100%" />
          </div>
        </div>

        <p className="text-xs text-emerald-100/80">
          © 2026 Smart Expense Tracker. Built with Next.js 16, Prisma & JWT.
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-semibold">Smart Expense</span>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to access your dashboard and reports.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        {...loginForm.register('email')}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-red-500">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register('password')}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-red-500">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create your account</CardTitle>
                  <CardDescription>
                    Start tracking your finances in under a minute.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="John Doe"
                        {...registerForm.register('name')}
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-xs text-red-500">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        {...registerForm.register('email')}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-xs text-red-500">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="8+ chars"
                          {...registerForm.register('password')}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-xs text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Confirm</Label>
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="Repeat"
                          {...registerForm.register('confirmPassword')}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-red-500">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={registerLoading}>
                      {registerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof TrendingUp
  title: string
  desc: string
}) {
  return (
    <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
      <Icon className="mb-2 h-5 w-5" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-emerald-50/80">{desc}</p>
    </div>
  )
}
