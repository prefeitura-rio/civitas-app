import { sub } from "date-fns"

export function toQueryParams(props: object): URLSearchParams {
  const query = new URLSearchParams()

  Object.entries(props).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          query.append(key, item)
        })
      } else if (value instanceof Date) {
        query.set(key, value.toISOString())
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue instanceof Date) {
            query.set(subKey, subValue.toISOString())
          } else if (typeof subValue === 'number' || typeof subValue === 'boolean' || typeof subValue === 'string') {
            query.set(subKey, subValue.toString())
          }
        })
      } else {
        query.set(key, value)
      }
    }
  })

  return query
}
