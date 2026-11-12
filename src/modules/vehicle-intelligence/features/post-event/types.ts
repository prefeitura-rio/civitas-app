import type {
  CorrelationRankingRow,
  CrimeType,
  Insight,
} from '@/modules/vehicle-intelligence/types/domain'

export type Breakdown = { label: string; count: number; percentage: number }

type PoleSummary = {
  occurrences: number
  vehicles: number
  plate_ids: string[]
  distinct_days: number
  cisp_breakdown: Breakdown[]
  target_breakdown: Breakdown[]
}

export type DisconnectionRadar = PoleSummary & {
  point_id: string
  location: string | null
  neighborhood: string | null
  direction: string | null
  latitude: number
  longitude: number
  event_ids: string[]
  modality_breakdown: Breakdown[]
  recent_detection_times: string[]
  median_elapsed_hours: number | null
}

export type DestinationPole = PoleSummary & {
  id: string
  kind: 'cluster' | 'concentration'
  name: string
  neighborhood: string | null
  street: string | null
  latitude: number
  longitude: number
  street_incidence: number
  radius_meters: number
  radar_count: number
  point_ids: string[]
  radars: DisconnectionRadar[]
  event_ids: string[]
  modality_breakdown: Breakdown[]
  recent_detection_times: string[]
  median_elapsed_hours: number | null
}

export type OriginPoleEvent = {
  event_id: string
  event_time: string | null
  cisp: string | null
  target_category: string | null
  address: string | null
  latitude: number
  longitude: number
  plates: string[]
  cited_plates: string[]
}

export type OriginPole = PoleSummary & {
  id: string
  kind: 'cluster' | 'concentration'
  modality: string
  name: string
  neighborhood: string | null
  street: string | null
  latitude: number
  longitude: number
  street_incidence: number
  radius_meters: number
  cisp_count: number
  tracked_occurrences: number
  cited_occurrences: number
  events: OriginPoleEvent[]
}

export type PoleConnection = {
  id: string
  origin_id: string
  destination_id: string
  modality: string
  origin_name: string
  destination_name: string
  occurrences: number
  vehicles: number
  plate_ids: string[]
  median_elapsed_hours: number | null
  origin_share_percentage: number
  destination_share_percentage: number
  origin_latitude: number
  origin_longitude: number
  destination_latitude: number
  destination_longitude: number
  recurrent: boolean
}

export type CorridorStep = {
  key: string
  label: string
  location: string | null
  direction: string | null
  point_ids: string[]
  latitude: number | null
  longitude: number | null
}

export type Corridor = {
  id: string
  level: 'street' | 'equipment'
  length: number
  steps: CorridorStep[]
  events: number
  trips: number
  plates: number
  plate_ids: string[]
  event_ids: string[]
  repetitions: number
  terminal_percentage: number
  median_start_after_event_hours: number | null
  median_trip_duration_minutes: number | null
}

export type RepeatedRadar = {
  point_id: string
  location: string | null
  direction: string | null
  neighborhood: string | null
  latitude: number
  longitude: number
  events: number
  trips: number
  plates: number
  plate_ids: string[]
  event_ids: string[]
  detections: number
}

export type Disconnection = {
  event_id: string
  plate: string
  cited: boolean
  point_id: string | null
  latitude: number | null
  longitude: number | null
  location: string | null
  neighborhood: string | null
  direction: string | null
  event_time: string
  detected_at: string
  resumed_at: string
  hiatus_hours: number
  elapsed_hours: number | null
  cisp: string | null
  modality: string | null
  target_category: string | null
  simultaneous_points: number
}

export type PostEventData = {
  ready: boolean
  reason?: string
  build_id?: string
  view: string
  disconnections: Disconnection[]
  ranking: Array<
    CorrelationRankingRow & {
      rank: number
      circulation_days: number | null
      observed_circulation_days: number
      detections: number
      post_detections: number
      post_days: number
      tracked_events: number
      trips: number
      cited_events: number
      correlated_events: number
    }
  >
  origin_poles: OriginPole[]
  destination_poles: DestinationPole[]
  pole_connections: PoleConnection[]
  street_corridors: Corridor[]
  equipment_corridors: Corridor[]
  repeated_radars: RepeatedRadar[]
  trip_summary: {
    trips: number
    events: number
    plates: number
    multi_point_trips: number
    three_street_trips: number
    median_multi_detection_duration_minutes: number | null
  }
  cluster_coverage: {
    origin_events: number
    origin_events_clustered: number
    tracked_events_in_origin_poles: number
    destination_pairs: number
    destination_pairs_clustered: number
  }
  daily: Array<{ day: string; detections: number; plates: number }>
  hours: Array<{ hour: number; detections: number; plates: number }>
  weekdays: Array<{ weekday: number; detections: number; plates: number }>
  summary: {
    plates: number
    eligible_plates: number
    events: number
    detections: number
    active_days: number
    post_detections: number
    tracked_pairs: number
    pairs_without_readings: number
    pairs_without_hiatus: number
    disconnect_pairs: number
  }
  methodology: {
    event_window_minutes: number
    radius_meters: number
    hiatus_hours: number
    trip_gap_minutes: number
    origin_cluster_parameters: Record<
      string,
      { radius_meters: number; minimum_events: number }
    >
    origin_concentration_parameters: {
      radius_meters: number
      minimum_events: number
      minimum_days: number
    }
    destination_radius_meters: number
    destination_minimum_points: number
    terminal_minimum_events: number
    terminal_minimum_days: number
    recurrent_connection_minimum_events: number
    corridor_minimum_length: number
    corridor_maximum_length: number
    ranking_rule: string
    destination_rule: string
    origin_rule: string
    cluster_rule: string
    connection_rule: string
    corridor_rule: string
    circulation_rule: string
    warning: string
    period_start: string | null
    period_end: string | null
  }
}

// Veículos e carga: trajetória do veículo vítima depois do fato (motores de copassagem).

export interface Detection {
  event_id: string | number
  sequence: number
  plate: string
  detected_at: string
  point_id: string
  camera: string
  latitude: number
  longitude: number
  location: string
  neighborhood: string
  direction: string
  vehicle_type: string
}

export interface LocationHotspot {
  /** Carga: desconexões por categoria. */
  category_counts?: Partial<Record<CrimeType, number>>
  group_key?: string
  point_id: string
  point_ids: string[]
  radar_count: number
  location: string
  neighborhood: string | null
  locations: string[]
  cameras: string
  occurrences: number
  vehicles: number
  distinct_days: number
  cisp_count: number
  cisps: string
  last_detected_at: string
  final_share_percentage: number
  vehicle_share_percentage: number
  cisp_share_percentage: number
  cisp_breakdown: Array<{ cisp: string; endings: number; percentage: number }>
  vehicle_breakdown: Array<{
    category: string
    endings: number
    percentage: number
  }>
  recent_detection_times: string[]
  latitude: number
  longitude: number
}

export interface TerminalHub extends LocationHotspot {
  kind: 'terminal_hub'
}

export interface PostEventOrigin {
  event_id: string
  plate: string
  cisp: string
  modality: CrimeType
  target_category: string
  vehicle_model: string
  event_time: string | null
  event_latitude: number | null
  event_longitude: number | null
  event_address: string | null
  geocode_quality: string | null
  classificacao?: string
  papel_placa?: string
  confianca_papel?: string
  precisao_horario?: string
  horario_data_divergente?: string
  delito_original?: string
  destination_detected_at: string
  destination_point_id: string
  destination_location: string
  destination_latitude: number
  destination_longitude: number
  elapsed_hours: number | null
}

export interface DestinationCluster {
  /** Carga: desconexões por categoria. */
  category_counts?: Partial<Record<CrimeType, number>>
  id: number
  name: string
  neighborhood: string | null
  street: string | null
  latitude: number
  longitude: number
  centroid_latitude: number
  centroid_longitude: number
  street_incidence: number
  concentration_incidence: number
  center_rule: 'dominant_street_highest_concentration'
  radius_meters: number
  destination_points: number
  point_ids: string[]
  occurrences: number
  vehicles: number
  origin_points_geocoded: number
  destinations: LocationHotspot[]
  origins: PostEventOrigin[]
}

export interface OriginCluster {
  id: string
  kind: 'dbscan' | 'concentration'
  name: string
  neighborhood: string | null
  street: string | null
  modality: CrimeType
  latitude: number
  longitude: number
  centroid_latitude: number
  centroid_longitude: number
  street_incidence: number
  concentration_incidence: number
  center_rule: 'dominant_street_highest_concentration'
  radius_meters: number
  occurrences: number
  distinct_days: number
  vehicles: number
  cisp_count: number
  events: PostEventOrigin[]
}

export interface ClusterConnection {
  id: string
  origin_cluster_id: string
  destination_cluster_id: number | null
  destination_hub_id: string | null
  destination_pole_kind: 'dbscan' | 'concentration'
  modality: CrimeType
  origin_cluster_name: string
  destination_cluster_name: string
  occurrences: number
  vehicles: number
  median_elapsed_hours: number | null
  origin_share_percentage: number
  destination_share_percentage: number
  origin_latitude: number
  origin_longitude: number
  destination_latitude: number
  destination_longitude: number
}

export interface TripCorridorStep {
  key: string
  label: string
  point_ids: string[]
  cameras: string[]
  direction: string | null
  latitude: number | null
  longitude: number | null
}

export interface TripCorridor {
  id: string
  level: 'street' | 'equipment'
  sequence: string[]
  signature: string
  length: number
  repetitions: number
  trips: number
  events: number
  plates: number
  cisp_count: number
  initial_trips: number
  terminal_trips: number
  terminal_percentage: number
  first_trip_events: number
  events_within_6h: number
  median_trip_duration_minutes: number | null
  median_start_after_event_hours: number | null
  steps: TripCorridorStep[]
}

export interface TripSummary {
  trips: number
  events: number
  plates: number
  multi_detection_trips: number
  multi_point_trips: number
  three_street_trips: number
  first_trips: number
  trips_started_within_2h: number
  trips_started_within_6h: number
  trips_started_within_24h: number
  average_detections: number | null
  average_duration_minutes: number | null
  median_duration_minutes: number | null
  median_multi_detection_duration_minutes: number | null
}

export interface MasterPostData {
  ready: boolean
  reason?: string
  missing_source?: string
  build_command?: string
  summary: {
    tracked_events: number
    plates_detected: number
    detections: number
    timeline_displayed: number
    cisps: number
    territory_alerts: number
    route_patterns: number
  }
  timeline: Detection[]
  last_detections: Array<
    Detection & {
      cisp: string
      modality: CrimeType
      target_category: string
      vehicle_model: string
      territory_name: string | null
      armed_group: string | null
      territory_distance_meters: number | null
    }
  >
  last_detection_pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
    search: string
  }
  common_routes: Array<{
    origin: string
    destination: string
    count: number
    events: number
    cisp_count: number
    origin_latitude: number
    origin_longitude: number
    destination_latitude: number
    destination_longitude: number
  }>
  route_sequences: TripCorridor[]
  street_corridors: TripCorridor[]
  equipment_corridors: TripCorridor[]
  trip_summary: TripSummary
  route_graph: {
    nodes: Array<{ id: string; label: string; kind: 'location' }>
    edges: Array<{ source: string; target: string; weight: number }>
  }
  disappearance_hotspots: LocationHotspot[]
  destination_clusters: DestinationCluster[]
  destination_hubs: TerminalHub[]
  unclustered_destinations: LocationHotspot[]
  origin_clusters: OriginCluster[]
  cluster_connections: ClusterConnection[]
  cluster_coverage: {
    origin_events_clustered: number
    origin_events_unclustered: number
    destination_events_clustered: number
    destination_events_unclustered: number
  }
  armed_groups: Array<{
    group_name: string
    last_detections: number
    alerts_1km: number
  }>
  insights: Insight[]
  methodology: Record<string, string | number>
}
