import React from 'react'

import { ActionButtons } from './side-pannel/action-buttons'
import { FilterForm } from './side-pannel/filter-form'
import { TripList } from './side-pannel/trip-list'

export function SidePanel() {
  return (
    <div className="flex h-screen w-full max-w-md flex-col px-2">
      <FilterForm />
      <ActionButtons />
      <TripList />
    </div>
  )
}
