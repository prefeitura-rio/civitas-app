import { MDXProvider } from '@mdx-js/react'
import React from 'react'

const CustomMDXProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MDXProvider>
      <div className="list-decoration">{children}</div>
    </MDXProvider>
  )
}

export default CustomMDXProvider
