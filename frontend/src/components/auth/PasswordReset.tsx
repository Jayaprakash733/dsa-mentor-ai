import React, { useState } from 'react'
import { Button } from '../common/Button'
import { Alert } from '../common/Alert'

interface PasswordResetProps {
  onReset?: (email: string) => Promise<void>
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  onReset,
}) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setMessage('')
    setError('')

    try {
      if (onReset) {
        await onReset(email)
      }

      setMessage('Password reset instructions have been sent to your email.')
    } catch {
      setError('Unable to process your request. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <Alert
          type="error"
          message={error}
        />
      )}

      {message && (
        <Alert
          type="success"
          message={message}
        />
      )}

      <div>
        <label
          htmlFor="reset-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>

        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
      >
        Reset Password
      </Button>

    </form>
  )
}