import { type MapViewState, WebMercatorViewport } from '@deck.gl/core'
import {
  Deck,
  IconLayer,
  LineLayer,
  type PickingInfo,
  PolygonLayer,
  ScatterplotLayer,
} from 'deck.gl'
import type { Feature } from 'geojson'
import {
  type MouseEvent,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MapRef } from 'react-map-gl'

import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { Option } from '@/components/custom/multiselect-with-search'
import { useCollectionPoints } from '@/hooks/useQueries/useCollectionPoints'
import { getPlaces } from '@/http/mapbox/get-places'
import type { CollectionPoint } from '@/models/entities'
import { haversineDistance } from '@/utils/haversine-distance'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

import {
  buildOptionsFromCollectionPoints,
  buildPointMeta,
  getCollectionPointIdsWithinPolygon,
  getMapViewport,
  isFullCollectionPointSelection,
  isPointVisibleInViewport,
  optionsFromCollectionPointIds,
  sortCollectionPoints,
} from './collection-point-picker-utils'

const PICKER_MAP_WIDTH = 720
const PICKER_MAP_HEIGHT = 620
const RADAR_LIST_HEIGHT = 430
const RADAR_LIST_ITEM_HEIGHT = 92
const RADAR_LIST_OVERSCAN = 6
const RADAR_LIST_PAGE_SIZE = 20
const POINT_LAYER_ID = 'collection-point-picker-point-layer'
const AREA_VERTEX_LAYER_ID = 'collection-point-picker-area-vertex-layer'
const AREA_LINE_LAYER_ID = 'collection-point-picker-area-line-layer'
const AREA_POLYGON_LAYER_ID = 'collection-point-picker-area-polygon-layer'

type AreaSelectionMode = 'polygon' | null
type LngLatTuple = [number, number]

const iconMapping = {
  default: { x: 0, y: 0, width: 48, height: 48, mask: false },
  disabled: { x: 0, y: 48, width: 48, height: 48, mask: false },
  highlighted: { x: 48, y: 0, width: 48, height: 48, mask: false },
  'disabled-highlighted': {
    x: 48,
    y: 48,
    width: 48,
    height: 48,
    mask: false,
  },
  'sentry-default': { x: 0, y: 96, width: 48, height: 48, mask: false },
  'sentry-highlighted': { x: 48, y: 96, width: 48, height: 48, mask: false },
  'sentry-disabled': { x: 0, y: 144, width: 48, height: 48, mask: false },
  'sentry-disabled-highlighted': {
    x: 48,
    y: 144,
    width: 48,
    height: 48,
    mask: false,
  },
} as const

export interface RadarPopupState {
  point: CollectionPoint
  x: number
  y: number
}

interface UseCollectionPointPickerStateProps {
  value: string[]
  onChange: (ids: string[]) => void
  /** Quando true, seleciona automaticamente todos os pontos na primeira carga,
   *  se nenhum ponto estiver selecionado. */
  defaultSelectAll?: boolean
}

function getPopupPosition(x: number, y: number, width: number, height: number) {
  const popupWidth = 320
  const popupHeight = 260
  const gap = 16

  const left =
    x + popupWidth + gap > width ? Math.max(12, x - popupWidth - gap) : x + gap
  const top =
    y + popupHeight + gap > height
      ? Math.max(12, y - popupHeight - gap)
      : y + gap

  return { left, top }
}

function getFeatureCoordinates(feature: Feature): [number, number] | null {
  if (feature.geometry?.type !== 'Point') return null

  const coordinates = feature.geometry.coordinates
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null

  return [coordinates[0], coordinates[1]]
}

function getCollectionPointSelectionId(point: CollectionPoint) {
  return point.cetRioCode
}

function getPickingButton(info: PickingInfo<CollectionPoint>) {
  const sourceEvent = (
    info as PickingInfo<CollectionPoint> & {
      srcEvent?: { button?: number }
    }
  ).srcEvent

  return sourceEvent?.button ?? 0
}

function buildPolygonFeature(points: LngLatTuple[]) {
  if (points.length < 3) return null

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[...points, points[0]]],
    },
  }
}

export function useCollectionPointPickerState({
  value,
  onChange,
  defaultSelectAll = false,
}: UseCollectionPointPickerStateProps) {
  const { data: collectionPoints, isPending } = useCollectionPoints()
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [mapSearch, setMapSearch] = useState('')
  const [isMapSearchLoading, setIsMapSearchLoading] = useState(false)
  const [mapSearchError, setMapSearchError] = useState<string | null>(null)
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState<Feature[]>(
    [],
  )
  const [openMapSearchSuggestions, setOpenMapSearchSuggestions] =
    useState(false)
  const [draftValue, setDraftValue] = useState<string[]>(value)
  const [focusedPointId, setFocusedPointId] = useState<string | null>(null)
  const [showSelectedOnlyInList, setShowSelectedOnlyInList] = useState(false)
  const [showSelectedOnlyInMap, setShowSelectedOnlyInMap] = useState(false)
  const [showSelectedSection, setShowSelectedSection] = useState(true)
  const [popupState, setPopupState] = useState<RadarPopupState | null>(null)
  const [pendingScrollOptionId, setPendingScrollOptionId] = useState<
    string | null
  >(null)
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false)
  const [areaSelectionMode, setAreaSelectionMode] =
    useState<AreaSelectionMode>(null)
  const [areaSelectedIds, setAreaSelectedIds] = useState<string[]>([])
  const [areaDraftPoints, setAreaDraftPoints] = useState<LngLatTuple[]>([])
  const deckRef = useRef<Deck | null>(null)
  const mapRef = useRef<MapRef | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const listViewportRef = useRef<HTMLDivElement | null>(null)
  const suppressMapClickUntilRef = useRef(0)
  const [listScrollTop, setListScrollTop] = useState(0)
  const [loadedListResultsCount, setLoadedListResultsCount] =
    useState(RADAR_LIST_PAGE_SIZE)
  const [viewState, setViewState] = useState<MapViewState>({
    ...INITIAL_VIEW_PORT,
    pitch: 0,
    bearing: 0,
  })

  const sortedCollectionPoints = useMemo(
    () => sortCollectionPoints(collectionPoints),
    [collectionPoints],
  )

  const options = useMemo(
    () => buildOptionsFromCollectionPoints(sortedCollectionPoints),
    [sortedCollectionPoints],
  )

  const collectionPointsById = useMemo(
    () =>
      new Map(
        (collectionPoints ?? []).map((point) => [
          getCollectionPointSelectionId(point),
          point,
        ]),
      ),
    [collectionPoints],
  )

  const selectedOptions = useMemo(
    () => optionsFromCollectionPointIds(value, options),
    [value, options],
  )

  const draftSelectedOptions = useMemo(
    () => optionsFromCollectionPointIds(draftValue, options),
    [draftValue, options],
  )

  const selectedPoints = useMemo(
    () =>
      draftValue
        .map((id) => collectionPointsById.get(id))
        .filter((point): point is CollectionPoint => Boolean(point)),
    [collectionPointsById, draftValue],
  )

  const mapPoints = useMemo(
    () => (showSelectedOnlyInMap ? selectedPoints : (collectionPoints ?? [])),
    [collectionPoints, selectedPoints, showSelectedOnlyInMap],
  )

  const mapWidth = mapContainerRef.current?.clientWidth ?? PICKER_MAP_WIDTH
  const mapHeight = mapContainerRef.current?.clientHeight ?? PICKER_MAP_HEIGHT

  const mapViewportBounds = useMemo(() => {
    const viewport = new WebMercatorViewport({
      width: mapWidth,
      height: mapHeight,
      longitude: viewState.longitude,
      latitude: viewState.latitude,
      zoom: viewState.zoom,
      pitch: viewState.pitch ?? 0,
      bearing: viewState.bearing ?? 0,
    })
    const [west, south] = viewport.unproject([0, mapHeight])
    const [east, north] = viewport.unproject([mapWidth, 0])

    return { west, south, east, north }
  }, [mapHeight, mapWidth, viewState])

  const areaPolygonFeature = useMemo(
    () => buildPolygonFeature(areaDraftPoints),
    [areaDraftPoints],
  )

  const listBuckets = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase()
    const matchingOptions = !normalized
      ? options
      : options.filter((option) => {
          const point = collectionPointsById.get(option.value)
          const meta = buildPointMeta(point).join(' ').toLocaleLowerCase()

          return (
            option.label.toLocaleLowerCase().includes(normalized) ||
            option.value.toLocaleLowerCase().includes(normalized) ||
            meta.includes(normalized)
          )
        })
    const center = [viewState.longitude, viewState.latitude] as [number, number]
    const selectedOrder = new Map(draftValue.map((id, index) => [id, index]))
    const selectedEntries: Option[] = []
    const visibleEntries: Option[] = []
    const outsideEntries: Option[] = []

    const byDistanceToCenter = (optionA: Option, optionB: Option) => {
      const pointA = collectionPointsById.get(optionA.value)
      const pointB = collectionPointsById.get(optionB.value)
      const pointADistance = pointA
        ? haversineDistance({
            pointA: center,
            pointB: [pointA.longitude, pointA.latitude],
          })
        : Number.POSITIVE_INFINITY
      const pointBDistance = pointB
        ? haversineDistance({
            pointA: center,
            pointB: [pointB.longitude, pointB.latitude],
          })
        : Number.POSITIVE_INFINITY

      if (pointADistance !== pointBDistance) {
        return pointADistance - pointBDistance
      }

      return optionA.value.localeCompare(optionB.value, 'pt-BR', {
        sensitivity: 'base',
      })
    }

    matchingOptions.forEach((option) => {
      const point = collectionPointsById.get(option.value)
      const isSelected = draftValue.includes(option.value)

      if (isSelected) {
        selectedEntries.push(option)
      }

      if (point && isPointVisibleInViewport(point, mapViewportBounds)) {
        visibleEntries.push(option)
        return
      }

      outsideEntries.push(option)
    })

    selectedEntries.sort(
      (optionA, optionB) =>
        (selectedOrder.get(optionA.value) ?? Number.POSITIVE_INFINITY) -
        (selectedOrder.get(optionB.value) ?? Number.POSITIVE_INFINITY),
    )
    visibleEntries.sort(byDistanceToCenter)
    outsideEntries.sort(byDistanceToCenter)

    return {
      selectedEntries,
      visibleEntries,
      outsideEntries,
      selectedCount: selectedEntries.length,
      visibleCount: visibleEntries.length,
      outsideCount: outsideEntries.length,
      visibleIds: new Set(visibleEntries.map((option) => option.value)),
      hasActiveSearch: normalized.length > 0,
    }
  }, [
    collectionPointsById,
    draftValue,
    mapViewportBounds,
    options,
    search,
    viewState.latitude,
    viewState.longitude,
  ])

  const filteredOptions = useMemo(() => {
    if (showSelectedOnlyInList) {
      return listBuckets.selectedEntries.slice(0, loadedListResultsCount)
    }

    const limitedVisibleEntries = listBuckets.visibleEntries.slice(
      0,
      loadedListResultsCount,
    )
    const remainingCapacity = Math.max(
      0,
      loadedListResultsCount - limitedVisibleEntries.length,
    )
    const limitedOutsideEntries = listBuckets.hasActiveSearch
      ? listBuckets.outsideEntries.slice(0, remainingCapacity)
      : []

    return [...limitedVisibleEntries, ...limitedOutsideEntries]
  }, [listBuckets, loadedListResultsCount, showSelectedOnlyInList])

  const selectedListRows = useMemo(
    () =>
      draftValue
        .map((id) => collectionPointsById.get(id))
        .filter((point): point is CollectionPoint => Boolean(point)),
    [collectionPointsById, draftValue],
  )

  const displayedSelectedCount = Math.min(
    listBuckets.selectedCount,
    loadedListResultsCount,
  )
  const displayedVisibleCount = Math.min(
    listBuckets.visibleCount,
    loadedListResultsCount,
  )
  const displayedOutsideCount = listBuckets.hasActiveSearch
    ? Math.min(
        listBuckets.outsideCount,
        Math.max(0, loadedListResultsCount - displayedVisibleCount),
      )
    : 0
  const hasMoreListResults = showSelectedOnlyInList
    ? displayedSelectedCount < listBuckets.selectedCount
    : displayedVisibleCount < listBuckets.visibleCount ||
      displayedOutsideCount < listBuckets.outsideCount

  const allSelected = useMemo(
    () => isFullCollectionPointSelection(value, options),
    [value, options],
  )

  // Auto-seleciona todos os pontos na primeira carga quando `defaultSelectAll`
  // está ativo e nenhum ponto foi selecionado ainda.
  const hasAutoSelectedRef = useRef(false)
  useEffect(() => {
    if (!defaultSelectAll) return
    if (isPending || options.length === 0) return
    if (hasAutoSelectedRef.current) return
    hasAutoSelectedRef.current = true
    if (value.length > 0) return
    const allIds = options.map((o) => o.value)
    setDraftValue(allIds)
    onChange(allIds)
  }, [defaultSelectAll, isPending, onChange, options, value.length])

  const filteredOptionIndexById = useMemo(() => {
    const indexById = new Map<string, number>()
    filteredOptions.forEach((option, index) => {
      indexById.set(option.value, index)
    })
    return indexById
  }, [filteredOptions])

  const virtualRange = useMemo(() => {
    const total = filteredOptions.length
    const startIndex = Math.max(
      0,
      Math.floor(listScrollTop / RADAR_LIST_ITEM_HEIGHT) - RADAR_LIST_OVERSCAN,
    )
    const endIndex = Math.min(
      total,
      Math.ceil((listScrollTop + RADAR_LIST_HEIGHT) / RADAR_LIST_ITEM_HEIGHT) +
        RADAR_LIST_OVERSCAN,
    )

    return {
      startIndex,
      endIndex,
      items: filteredOptions.slice(startIndex, endIndex),
      topPadding: startIndex * RADAR_LIST_ITEM_HEIGHT,
      bottomPadding: Math.max(0, (total - endIndex) * RADAR_LIST_ITEM_HEIGHT),
      totalHeight: total * RADAR_LIST_ITEM_HEIGHT,
    }
  }, [filteredOptions, listScrollTop])

  function resetListViewport() {
    setLoadedListResultsCount(RADAR_LIST_PAGE_SIZE)
    setListScrollTop(0)
    if (listViewportRef.current) {
      listViewportRef.current.scrollTo({ top: 0 })
    }
  }

  function resetAreaSelectionState() {
    setAreaSelectionMode(null)
    setAreaSelectedIds([])
    setAreaDraftPoints([])
  }

  function clearAreaSelection() {
    resetAreaSelectionState()
  }

  useEffect(() => {
    if (!expanded) {
      setDraftValue(value)
      setSearch('')
      setMapSearch('')
      setMapSearchError(null)
      setMapSearchSuggestions([])
      setOpenMapSearchSuggestions(false)
      setFocusedPointId(null)
      setShowSelectedOnlyInList(false)
      setShowSelectedOnlyInMap(false)
      setShowSelectedSection(true)
      setPopupState(null)
      setPendingScrollOptionId(null)
      setHasInitializedViewport(false)
      resetAreaSelectionState()
      resetListViewport()
      setViewState({ ...INITIAL_VIEW_PORT, pitch: 0, bearing: 0 })
    }
  }, [expanded, value])

  useEffect(() => {
    if (!expanded || hasInitializedViewport) return

    const sourcePoints = mapPoints.length > 0 ? mapPoints : selectedPoints
    if (sourcePoints.length === 0) return

    setViewState(getMapViewport(sourcePoints, mapWidth, mapHeight))
    setHasInitializedViewport(true)
  }, [
    expanded,
    hasInitializedViewport,
    mapHeight,
    mapPoints,
    mapWidth,
    selectedPoints,
  ])

  useEffect(() => {
    let isCancelled = false

    async function loadMapSuggestions(query: string) {
      try {
        setMapSearchError(null)
        const response = await getPlaces(query)
        if (isCancelled) return
        setMapSearchSuggestions(response.features ?? [])
      } catch {
        if (isCancelled) return
        setMapSearchSuggestions([])
      }
    }

    const normalized = mapSearch.trim()
    if (normalized.length === 0) {
      setMapSearchSuggestions([])
      return () => {
        isCancelled = true
      }
    }

    const timeoutId = window.setTimeout(() => {
      loadMapSuggestions(normalized).catch(() => undefined)
    }, 200)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [mapSearch])

  useEffect(() => {
    if (!expanded) return

    resetListViewport()
  }, [expanded, search, showSelectedOnlyInList])

  useEffect(() => {
    if (!expanded || !pendingScrollOptionId) return

    const index = filteredOptionIndexById.get(pendingScrollOptionId)
    const viewport = listViewportRef.current

    if (index === undefined) return

    const requiredCount = index + 1
    if (requiredCount > loadedListResultsCount) {
      setLoadedListResultsCount(requiredCount)
      return
    }

    if (!viewport) return

    const itemTop = index * RADAR_LIST_ITEM_HEIGHT
    const itemBottom = itemTop + RADAR_LIST_ITEM_HEIGHT
    const viewportTop = viewport.scrollTop
    const viewportBottom = viewportTop + RADAR_LIST_HEIGHT

    if (itemTop < viewportTop) {
      viewport.scrollTo({ top: itemTop, behavior: 'smooth' })
    } else if (itemBottom > viewportBottom) {
      viewport.scrollTo({
        top: itemBottom - RADAR_LIST_HEIGHT,
        behavior: 'smooth',
      })
    }

    setPendingScrollOptionId(null)
  }, [
    expanded,
    filteredOptionIndexById,
    loadedListResultsCount,
    pendingScrollOptionId,
  ])

  function scrollListToOption(optionId: string) {
    setPendingScrollOptionId(optionId)
  }

  function updateSelection(nextIds: string[]) {
    setDraftValue(nextIds)
    onChange(nextIds)
  }

  function toggleDraftId(id: string) {
    setDraftValue((prev) => {
      const nextIds = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]

      onChange(nextIds)
      return nextIds
    })
  }

  function centerPointOnMap(point: CollectionPoint) {
    if (isPointVisibleInViewport(point, mapViewportBounds)) {
      return
    }

    setViewState((prev) => ({
      ...prev,
      longitude: point.longitude,
      latitude: point.latitude,
      zoom: Math.max(prev.zoom ?? 0, 13.5),
      transitionDuration: 300,
    }))
  }

  function previewPoint(point: CollectionPoint) {
    setFocusedPointId(getCollectionPointSelectionId(point))
    setPopupState(null)
    scrollListToOption(getCollectionPointSelectionId(point))
    centerPointOnMap(point)
  }

  function togglePointFromMapOrList(point: CollectionPoint) {
    const pointId = getCollectionPointSelectionId(point)
    const isSelected = draftValue.includes(pointId)

    setFocusedPointId(isSelected ? null : pointId)
    setPopupState(null)
    scrollListToOption(pointId)
    centerPointOnMap(point)
    toggleDraftId(pointId)
  }

  function toggleExpanded() {
    setExpanded((prev) => !prev)
  }

  function openPickerWithSelectedList(optionId?: string) {
    setDraftValue(value)
    setShowSelectedOnlyInList(true)
    setShowSelectedOnlyInMap(true)
    setExpanded(true)
    setPopupState(null)

    if (optionId) {
      const point = collectionPointsById.get(optionId)

      setFocusedPointId(optionId)
      setPendingScrollOptionId(optionId)
      if (point) centerPointOnMap(point)
    } else {
      setFocusedPointId(null)
    }
  }

  function openPicker() {
    setDraftValue(value)
    setExpanded(true)
  }

  function closePicker() {
    setDraftValue(value)
    setExpanded(false)
  }

  function clearCommittedSelection() {
    setDraftValue([])
    onChange([])
  }

  function toggleSelectedOnlyInMap() {
    clearAreaSelection()
    setFocusedPointId(null)
    setPopupState(null)
    setShowSelectedOnlyInMap((prev) => !prev)
  }

  function selectAllCollectionPointIds() {
    updateSelection(options.map((option) => option.value))
  }

  function clearDraftSelection() {
    updateSelection([])
    clearAreaSelection()
    setFocusedPointId(null)
    setPopupState(null)
  }

  function handleApply() {
    onChange(draftValue)
    setExpanded(false)
  }

  function handleMapContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (areaSelectionMode) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    suppressMapClickUntilRef.current = Date.now() + 250

    const container = mapContainerRef.current
    const deck = deckRef.current
    if (!container || !deck) return

    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const picked = deck.pickObject({
      x,
      y,
      radius: 8,
      layerIds: [POINT_LAYER_ID],
    }) as PickingInfo<CollectionPoint>

    if (!picked?.object) {
      setPopupState(null)
      return
    }

    const position = getPopupPosition(
      x,
      y,
      container.clientWidth,
      container.clientHeight,
    )
    previewPoint(picked.object)
    setPopupState({
      point: picked.object,
      x: position.left,
      y: position.top,
    })
  }

  function fitSelectedPoints() {
    if (selectedPoints.length === 0) return
    setFocusedPointId(null)
    setPopupState(null)
    setViewState(getMapViewport(selectedPoints, mapWidth, mapHeight))
  }

  function fitMapPoints() {
    if (mapPoints.length === 0) return
    setFocusedPointId(null)
    setPopupState(null)
    setViewState(getMapViewport(mapPoints, mapWidth, mapHeight))
  }

  function applyMapSearchFeature(feature: Feature) {
    const coordinates = getFeatureCoordinates(feature)

    if (!coordinates) {
      setMapSearchError('Nenhum endereco encontrado.')
      return
    }

    const [longitude, latitude] = coordinates

    setFocusedPointId(null)
    setPopupState(null)
    setOpenMapSearchSuggestions(false)
    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom: Math.max(prev.zoom ?? 0, 14),
      transitionDuration: 400,
    }))
  }

  async function handleMapSearchSubmit() {
    const query = mapSearch.trim()
    if (!query) return

    if (mapSearchSuggestions.length > 0) {
      applyMapSearchFeature(mapSearchSuggestions[0])
      return
    }

    try {
      setIsMapSearchLoading(true)
      setMapSearchError(null)

      const response = await getPlaces(query)
      const feature = response.features?.[0]

      if (!feature) {
        setMapSearchError('Nenhum endereco encontrado.')
        return
      }

      setMapSearchSuggestions(response.features ?? [])
      applyMapSearchFeature(feature)
    } catch {
      setMapSearchError('Nao foi possivel buscar este endereco.')
    } finally {
      setIsMapSearchLoading(false)
    }
  }

  function handleMapSearchFocus() {
    setOpenMapSearchSuggestions(true)
  }

  function handleMapSearchChange(nextValue: string) {
    setMapSearch(nextValue)
    setOpenMapSearchSuggestions(true)
    if (mapSearchError) setMapSearchError(null)
  }

  function clearMapSearch() {
    setMapSearch('')
    setMapSearchError(null)
    setMapSearchSuggestions([])
    setOpenMapSearchSuggestions(false)
  }

  function toggleSelectedOnlyInList() {
    setShowSelectedOnlyInList((prev) => !prev)
  }

  function toggleSelectedSection() {
    setShowSelectedSection((prev) => !prev)
  }

  function handleSearchChange(nextValue: string) {
    setSearch(nextValue)
  }

  function handleListScroll(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget
    const nextScrollTop = viewport.scrollTop
    setListScrollTop(nextScrollTop)

    const distanceToBottom =
      viewport.scrollHeight - (nextScrollTop + viewport.clientHeight)

    if (distanceToBottom <= RADAR_LIST_ITEM_HEIGHT * 2 && hasMoreListResults) {
      setLoadedListResultsCount((prev) => prev + RADAR_LIST_PAGE_SIZE)
    }
  }

  function handleMapBackgroundClick(info: PickingInfo) {
    if (areaSelectionMode === 'polygon') {
      const coordinates = info.coordinate as LngLatTuple | undefined
      if (!coordinates) return

      setPopupState(null)
      setFocusedPointId(null)
      setAreaDraftPoints((prev) => [...prev, coordinates])
      return
    }

    if (!info.object) {
      setFocusedPointId(null)
      setPopupState(null)
    }
  }

  function completeAreaSelection() {
    if (areaDraftPoints.length < 3) return

    const polygonFeature = buildPolygonFeature(areaDraftPoints)
    if (!polygonFeature) return

    const nextIds = getCollectionPointIdsWithinPolygon(
      mapPoints,
      polygonFeature,
    )
    setAreaSelectedIds(nextIds)
    setDraftValue((prev) => {
      const selectedIds = Array.from(new Set([...prev, ...nextIds]))

      onChange(selectedIds)
      return selectedIds
    })
    setAreaSelectionMode(null)
  }

  function undoLastAreaPoint() {
    setAreaDraftPoints((prev) => prev.slice(0, -1))
  }

  function handleViewStateChange(nextViewState: MapViewState) {
    setPopupState(null)
    setViewState(nextViewState)
  }

  function handleMapLoad() {
    // Kept for parity with the existing picker API.
  }

  function startAreaSelection() {
    setFocusedPointId(null)
    setPopupState(null)
    setAreaSelectedIds([])
    setAreaDraftPoints([])
    setAreaSelectionMode('polygon')
  }

  const pointLayer = useMemo(
    () =>
      new IconLayer<CollectionPoint>({
        id: POINT_LAYER_ID,
        data: mapPoints,
        pickable: true,
        sizeScale: 24,
        iconAtlas: radarIconAtlas.src,
        iconMapping,
        getPosition: (point) => [point.longitude, point.latitude],
        getIcon: (point) => {
          const isSelected = draftValue.includes(
            getCollectionPointSelectionId(point),
          )
          const isFocused =
            focusedPointId === getCollectionPointSelectionId(point)
          const isActive = point.activeInLast24Hours
          const prefix =
            point.company?.toUpperCase() === 'CIVITAS' ? 'sentry-' : ''

          if (isSelected || isFocused) {
            return `${prefix}${isActive ? 'highlighted' : 'disabled-highlighted'}`
          }

          return `${prefix}${isActive ? 'default' : 'disabled'}`
        },
        updateTriggers: {
          getIcon: [draftValue, focusedPointId],
        },
        onClick: (info: PickingInfo<CollectionPoint>) => {
          if (!info.object) return
          if (areaSelectionMode) return
          if (Date.now() < suppressMapClickUntilRef.current) return
          if (getPickingButton(info) !== 0) return

          togglePointFromMapOrList(info.object)
        },
      }),
    [areaSelectionMode, draftValue, focusedPointId, mapPoints],
  )

  const areaLineLayer = useMemo(() => {
    if (areaDraftPoints.length < 2) return null

    return new LineLayer<LngLatTuple>({
      id: AREA_LINE_LAYER_ID,
      data: areaDraftPoints,
      pickable: false,
      getSourcePosition: (_point, { index, data }) => data[index],
      getTargetPosition: (_point, { index, data }) =>
        data[Math.min(index + 1, data.length - 1)],
      getColor: [37, 99, 235, 220],
      getWidth: 3,
      widthUnits: 'pixels',
      parameters: { depthTest: false },
      visible: true,
    })
  }, [areaDraftPoints])

  const areaPolygonLayer = useMemo(() => {
    if (!areaPolygonFeature) return null

    return new PolygonLayer<LngLatTuple[]>({
      id: AREA_POLYGON_LAYER_ID,
      data: [areaPolygonFeature.geometry.coordinates[0] as LngLatTuple[]],
      pickable: false,
      stroked: true,
      filled: true,
      wireframe: false,
      getPolygon: (polygon) => polygon,
      getFillColor: [37, 99, 235, 48],
      getLineColor: [37, 99, 235, 220],
      getLineWidth: 2,
      lineWidthUnits: 'pixels',
      parameters: { depthTest: false },
    })
  }, [areaPolygonFeature])

  const areaVertexLayer = useMemo(() => {
    if (areaDraftPoints.length === 0) return null

    return new ScatterplotLayer<LngLatTuple>({
      id: AREA_VERTEX_LAYER_ID,
      data: areaDraftPoints,
      pickable: false,
      getPosition: (point) => point,
      getFillColor: [37, 99, 235, 255],
      getLineColor: [255, 255, 255, 255],
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 2,
      stroked: true,
      radiusUnits: 'pixels',
      radiusMinPixels: 5,
      radiusMaxPixels: 5,
      parameters: { depthTest: false },
    })
  }, [areaDraftPoints])

  const mapLayers = useMemo(
    () =>
      [areaPolygonLayer, areaLineLayer, areaVertexLayer, pointLayer].filter(
        Boolean,
      ),
    [areaLineLayer, areaPolygonLayer, areaVertexLayer, pointLayer],
  )

  return {
    allSelected,
    applyMapSearchFeature,
    areaDraftPointCount: areaDraftPoints.length,
    areaSelectedCount: areaSelectedIds.length,
    areaSelectionMode,
    clearAreaSelection,
    clearCommittedSelection,
    clearDraftSelection,
    clearMapSearch,
    closePicker,
    collectionPointsById,
    completeAreaSelection,
    deckRef,
    displayedOutsideCount,
    displayedSelectedCount,
    draftSelectedOptions,
    draftValue,
    expanded,
    filteredOptions,
    fitMapPoints,
    fitSelectedPoints,
    focusedPointId,
    handleApply,
    handleListScroll,
    handleMapBackgroundClick,
    handleMapContextMenu,
    handleMapLoad,
    handleMapSearchChange,
    handleMapSearchFocus,
    handleMapSearchSubmit,
    handleSearchChange,
    handleViewStateChange,
    hasAreaSelection: areaSelectedIds.length > 0,
    hasMoreListResults,
    isAreaSelectionCompleteReady: areaDraftPoints.length >= 3,
    isMapSearchLoading,
    isPending,
    listBuckets,
    listViewportRef,
    mapContainerRef,
    mapLayers,
    mapPoints,
    mapRef,
    mapSearch,
    mapSearchError,
    mapSearchSuggestions,
    openMapSearchSuggestions,
    openPicker,
    openPickerWithSelectedList,
    options,
    popupState,
    previewPoint,
    search,
    selectAllCollectionPointIds,
    selectedListRows,
    selectedOptions,
    selectedPoints,
    setMapSearch,
    setOpenMapSearchSuggestions,
    showSelectedOnlyInList,
    showSelectedOnlyInMap,
    showSelectedSection,
    startAreaSelection,
    toggleDraftId,
    toggleExpanded,
    togglePointFromMapOrList,
    toggleSelectedOnlyInList,
    toggleSelectedOnlyInMap,
    toggleSelectedSection,
    undoLastAreaPoint,
    value,
    viewState,
    virtualRange,
  }
}
