// import { Label } from '@/components/ui/label'

interface RadarInfoProps {
  // company: string
  // longitude: number
  // latitude: number
  location: string
}

// const radarLabels: Record<keyof RadarInfoProps, string> = {
// company: 'Empresa',
// longitude: 'Longitude',
// latitude: 'Latitude',
// location: 'Localização',
// }

export function RadarsInfo(props: RadarInfoProps) {
  return (
    <div className="mb">
      <h4 className="mb-4 mt-2">{props.location?.replace(/ - FX \d+/, '')}</h4>
      {/* <div className="ml-4">
        {Object.entries(radarLabels).map(([key, label], index) => (
          <div key={index}>
            <Label>{label}: </Label>
            <span className="text-xs text-muted-foreground">
              {props[key as keyof RadarInfoProps]}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  )
}
