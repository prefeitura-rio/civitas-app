import { Text } from '@react-pdf/renderer'

export function ReportFooter() {
  return (
    <Text
      style={{ position: 'absolute', bottom: 10, right: 20, fontSize: 10 }}
      render={({ pageNumber }) => pageNumber}
      fixed
    ></Text>
  )
}
