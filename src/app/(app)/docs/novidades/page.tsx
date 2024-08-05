'use client'
import CustomMDXProvider from '@/hooks/mdx-provider'

import Changelog from './components/changelog.mdx'

export default function Novidades() {
  return (
    <div className="page-content">
      <CustomMDXProvider>
        <div className="markdown">
          <Changelog />
        </div>
      </CustomMDXProvider>
    </div>
  )
}
