import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button, Input } from '../../components/ui/index'
import React from 'react'

export default function LoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-3">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Boston CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit(login)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@bostoncrm.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoggingIn}
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Boston CRM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
