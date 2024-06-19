'use client'
export function isAuthenticated() {
  const token = sessionStorage.getItem('token')
  return !!token
}
