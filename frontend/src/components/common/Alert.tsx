import React from 'react'

interface AlertProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export const Alert: React.FC<AlertProps> = ({
  message,
  type = 'info',
}) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-300',
    error: 'bg-red-100 text-red-700 border-red-300',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  return (
    <div
      className={`border rounded-lg p-3 ${styles[type]}`}
      role="alert"
    >
      {message}
    </div>
  )
}