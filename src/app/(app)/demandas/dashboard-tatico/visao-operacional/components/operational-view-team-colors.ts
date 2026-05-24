const TEAM_PALETTE = [
  '#b93d52',
  '#5b4db2',
  '#3d8cb9',
  '#06b2bb',
  '#c97b3d',
  '#7b3db9',
  '#3db97b',
  '#b9a03d',
] as const

export function getTeamColor(team: string, teams: string[]): string {
  const index = teams.indexOf(team)
  if (index >= 0) {
    return TEAM_PALETTE[index % TEAM_PALETTE.length]
  }
  let hash = 0
  for (let i = 0; i < team.length; i += 1) {
    hash = (hash + team.charCodeAt(i) * (i + 1)) % TEAM_PALETTE.length
  }
  return TEAM_PALETTE[hash]
}

export function collectTeamsFromSeries(series: { team: string }[]): string[] {
  return [...new Set(series.map((item) => item.team))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
}
