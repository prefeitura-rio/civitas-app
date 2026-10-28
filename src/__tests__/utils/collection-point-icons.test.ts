import {
  getCollectionPointIcon,
  RADAR_ICON_MAPPING,
} from '@/utils/collection-point-icons'

describe('collection point icons', () => {
  it.each([
    ['CETRIO', ''],
    ['CET-Rio', ''],
    ['CIVITAS', 'sentry-'],
    ['civitas', 'sentry-'],
    ['GABRIEL', 'gabriel-'],
    ['gabriel', 'gabriel-'],
    [null, ''],
    ['OTHER', ''],
  ])('selects the four states for source %s', (company, prefix) => {
    for (const activeInLast24Hours of [true, false]) {
      for (const highlighted of [true, false]) {
        const icon = getCollectionPointIcon(
          { company, activeInLast24Hours },
          highlighted,
        )
        const state = activeInLast24Hours
          ? highlighted
            ? 'highlighted'
            : 'default'
          : highlighted
            ? 'disabled-highlighted'
            : 'disabled'

        expect(icon).toBe(`${prefix}${state}`)
        expect(RADAR_ICON_MAPPING[icon]).toBeDefined()
      }
    }
  })
})
