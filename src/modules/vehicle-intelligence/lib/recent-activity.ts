export type RecentActivityWindow = 7 | 15 | 30 | 45

export type RecentActivityCounts = {
  detections_7d: number
  detections_15d: number
  detections_30d: number
  detections_45d: number
}

export function recentActivityWindow(
  activity: RecentActivityCounts,
): RecentActivityWindow | null {
  if (activity.detections_7d > 0) return 7
  if (activity.detections_15d > 0) return 15
  if (activity.detections_30d > 0) return 30
  if (activity.detections_45d > 0) return 45
  return null
}

export function recentActivityCount(
  activity: RecentActivityCounts,
  window: RecentActivityWindow,
): number {
  return activity[`detections_${window}d`]
}

export function recentActivityTone(window: RecentActivityWindow): string {
  return `activity-window-${window}`
}
