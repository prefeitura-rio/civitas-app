export function toQueryParams(props: object): URLSearchParams {
  const query = new URLSearchParams()

  Object.entries(props).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          query.append(key, item)
        })
      } else {
        query.set(key, value)
      }
    }
  })

  return query
}
