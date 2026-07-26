import 'mapbox-gl/dist/mapbox-gl.css'

import type { MapViewState } from '@deck.gl/core'
import { DeckGL } from 'deck.gl'
import { Check, Crosshair, MapPin, Navigation, Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import MapGl, { type ViewStateChangeEvent } from 'react-map-gl'

import { MAPBOX_ACCESS_TOKEN } from '@/app/(app)/veiculos/components/map/components/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { useCollectionPointPickerState } from './use-collection-point-picker-state'

interface MonitoredPlateAuthorityCollectionPointMultiSelectProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Exibe o toggle "Monitorar todos os pontos" e controla seu estado. */
  monitorAll?: boolean
  onMonitorAllChange?: (value: boolean) => void
  /** Quando true, seleciona todos os pontos automaticamente na primeira carga. */
  defaultSelectAll?: boolean
}

export function MonitoredPlateAuthorityCollectionPointMultiSelect({
  label = 'Pontos de coleta',
  description,
  value,
  onChange,
  disabled = false,
  monitorAll,
  onMonitorAllChange,
  defaultSelectAll = false,
}: MonitoredPlateAuthorityCollectionPointMultiSelectProps) {
  const hasMonitorAllToggle = onMonitorAllChange !== undefined
  const picker = useCollectionPointPickerState({
    value,
    onChange,
    defaultSelectAll,
  })

  // Abre o picker automaticamente quando o toggle passa de "monitorar todos" para "específicos"
  const prevMonitorAllRef = useRef(monitorAll)
  useEffect(() => {
    if (
      prevMonitorAllRef.current === true &&
      monitorAll === false &&
      !picker.expanded
    ) {
      picker.openPicker()
    }
    prevMonitorAllRef.current = monitorAll
  }, [monitorAll, picker])

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-foreground">{label}</Label>
        {description ? (
          <p className="text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {hasMonitorAllToggle ? (
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border p-3">
          <span className="text-sm">Monitorar todos os pontos de coleta</span>
          <Switch
            checked={monitorAll ?? true}
            onCheckedChange={onMonitorAllChange}
            disabled={disabled}
            aria-label="Monitorar todos os pontos de coleta"
          />
        </label>
      ) : null}

      {monitorAll ? (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          Todas as câmeras disponíveis serão monitoradas. Desative o toggle
          acima para selecionar pontos específicos.
        </p>
      ) : null}

      {!monitorAll && picker.expanded ? (
        <div className="min-w-0 rounded-lg border bg-background p-3 sm:p-4">
          <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
            {/* ── Coluna do mapa ─────────────────────────────────────────── */}
            <div className="flex min-h-0 flex-col gap-3">
              <div className="rounded-md border bg-muted/10 p-2">
                {/* Cabeçalho do mapa */}
                <div className="mb-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mapa</p>
                    <p className="text-xs text-muted-foreground">
                      Clique para selecionar radares. Botão direito para ver
                      detalhes. Use "Selecionar por área" para marcar múltiplos
                      radares de uma vez.
                    </p>
                  </div>

                  {/* Botões de visão */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={
                        picker.showSelectedOnlyInMap ? 'secondary' : 'outline'
                      }
                      size="sm"
                      className="h-8 text-xs"
                      disabled={picker.selectedPoints.length === 0}
                      onClick={picker.toggleSelectedOnlyInMap}
                    >
                      {picker.showSelectedOnlyInMap
                        ? 'Ver todos'
                        : 'Focar selecionados'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={picker.selectedPoints.length === 0}
                      onClick={picker.fitSelectedPoints}
                    >
                      <Crosshair className="mr-1 h-3.5 w-3.5" />
                      Centralizar selecionados
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={picker.mapPoints.length === 0}
                      onClick={picker.fitMapPoints}
                    >
                      Ver mapa completo
                    </Button>
                  </div>

                  {/* Botões de seleção por área */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={
                        picker.areaSelectionMode ? 'secondary' : 'outline'
                      }
                      size="sm"
                      className="h-8 text-xs"
                      disabled={
                        picker.mapPoints.length === 0 ||
                        picker.showSelectedOnlyInMap
                      }
                      onClick={picker.startAreaSelection}
                    >
                      Selecionar por área
                    </Button>
                    {picker.areaSelectionMode ||
                    picker.areaDraftPointCount > 0 ||
                    picker.hasAreaSelection ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={picker.areaDraftPointCount === 0}
                          onClick={picker.undoLastAreaPoint}
                        >
                          Desfazer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={!picker.isAreaSelectionCompleteReady}
                          onClick={picker.completeAreaSelection}
                        >
                          Confirmar área
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={picker.clearAreaSelection}
                        >
                          Limpar área
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Mapa */}
                <div
                  ref={picker.mapContainerRef}
                  className="relative h-[360px] overflow-hidden rounded-md border sm:h-[460px] xl:h-[620px]"
                  onContextMenu={picker.handleMapContextMenu}
                >
                  {/* Barra de busca de endereço */}
                  <div className="absolute inset-x-2 top-2 z-10 sm:left-auto sm:right-3 sm:top-3 sm:w-80">
                    <div className="rounded-md border bg-background/95 p-2 shadow-sm backdrop-blur">
                      <div className="flex flex-wrap items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={picker.mapSearch}
                          onFocus={picker.handleMapSearchFocus}
                          onChange={(event) =>
                            picker.handleMapSearchChange(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              picker
                                .handleMapSearchSubmit()
                                .catch(() => undefined)
                            }
                          }}
                          placeholder="Buscar rua ou endereço no mapa"
                          className="h-8 min-w-0 flex-1 basis-40"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          disabled={
                            picker.isMapSearchLoading ||
                            picker.mapSearch.trim().length === 0
                          }
                          onClick={() => {
                            picker
                              .handleMapSearchSubmit()
                              .catch(() => undefined)
                          }}
                        >
                          {picker.isMapSearchLoading ? 'Buscando…' : 'Ir'}
                        </Button>
                        {picker.mapSearch.trim() ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={picker.clearMapSearch}
                          >
                            Limpar
                          </Button>
                        ) : null}
                      </div>
                      {picker.openMapSearchSuggestions &&
                      picker.mapSearchSuggestions.length > 0 ? (
                        <div className="mt-2 max-h-56 overflow-y-auto rounded-md border bg-background p-1">
                          {picker.mapSearchSuggestions.map((item, index) => (
                            <button
                              key={`${item.properties?.mapbox_id ?? 'map-search'}-${index}`}
                              type="button"
                              className="flex w-full flex-col rounded-md px-2 py-2 text-left hover:bg-accent"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                picker.handleMapSearchChange(
                                  String(
                                    item.properties?.full_address ??
                                      item.properties?.name ??
                                      picker.mapSearch,
                                  ),
                                )
                                picker.applyMapSearchFeature(item)
                              }}
                            >
                              <span className="text-sm font-medium text-foreground">
                                {String(
                                  item.properties?.full_address ??
                                    item.properties?.name ??
                                    'Endereço',
                                )}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {String(
                                  item.properties?.place_formatted ??
                                    item.properties?.name_preferred ??
                                    '',
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {picker.mapSearchError ? (
                      <p className="mt-2 text-xs text-destructive">
                        {picker.mapSearchError}
                      </p>
                    ) : null}
                    {picker.showSelectedOnlyInMap ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Desative "Focar selecionados" para desenhar uma área no
                        mapa.
                      </p>
                    ) : picker.areaSelectionMode ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Clique no mapa para marcar os vértices. Use "Confirmar
                        área" ao terminar o contorno.
                      </p>
                    ) : picker.hasAreaSelection ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Área aplicada — {picker.areaSelectedCount} radar(es)
                        adicionado(s) à seleção.
                      </p>
                    ) : null}
                  </div>

                  {picker.mapPoints.length > 0 ? (
                    <DeckGL
                      ref={picker.deckRef}
                      style={{ width: '100%', height: '100%' }}
                      controller
                      viewState={picker.viewState}
                      layers={picker.mapLayers}
                      onClick={picker.handleMapBackgroundClick}
                      onViewStateChange={({ viewState: nextViewState }) => {
                        picker.handleViewStateChange(
                          nextViewState as MapViewState,
                        )
                      }}
                      getCursor={() =>
                        picker.areaSelectionMode ? 'crosshair' : 'pointer'
                      }
                    >
                      <MapGl
                        ref={picker.mapRef}
                        mapStyle="mapbox://styles/mapbox/light-v11"
                        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                        onLoad={picker.handleMapLoad}
                        onMove={(event: ViewStateChangeEvent) => {
                          picker.handleViewStateChange(event.viewState)
                        }}
                      />

                      {picker.popupState ? (
                        <div
                          className="absolute z-10 w-72 rounded-md border bg-background p-3 shadow-lg"
                          style={{
                            left: picker.popupState.x,
                            top: picker.popupState.y,
                          }}
                        >
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Código
                              </span>
                              <p className="text-sm font-semibold text-foreground">
                                {picker.popupState.point.cetRioCode}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Localização
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {picker.popupState.point.location ||
                                  'Não informado'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Navigation className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Bairro
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {picker.popupState.point.district ||
                                  'Não informado'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Navigation className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Sentido
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {picker.popupState.point.direction ||
                                  'Não informado'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </DeckGL>
                  ) : (
                    <div className="flex h-[360px] items-center justify-center px-6 text-center text-sm text-muted-foreground sm:h-[460px] xl:h-[620px]">
                      Nenhum ponto disponível para este filtro.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Coluna da lista ─────────────────────────────────────────── */}
            <div className="flex min-h-0 flex-col gap-3 rounded-md border bg-muted/20 px-3 pb-0 pt-3">
              {/* Cabeçalho com contagem */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Radares</p>
                <Badge variant="secondary" className="font-normal">
                  {picker.draftValue.length} selecionado(s)
                </Badge>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={picker.search}
                  onChange={(event) =>
                    picker.handleSearchChange(event.target.value)
                  }
                  placeholder={
                    picker.isPending
                      ? 'Carregando pontos…'
                      : 'Buscar por código, local, bairro ou faixa'
                  }
                  disabled={picker.isPending}
                  className="pl-9"
                />
              </div>

              {/* Tabs Todos / Selecionados */}
              <div className="flex rounded-md border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  className={cn(
                    'flex-1 rounded px-2 py-1.5 font-medium transition-colors',
                    !picker.showSelectedOnlyInList
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => {
                    if (picker.showSelectedOnlyInList)
                      picker.toggleSelectedOnlyInList()
                  }}
                >
                  Todos ({picker.options.length})
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex-1 rounded px-2 py-1.5 font-medium transition-colors',
                    picker.showSelectedOnlyInList
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => {
                    if (!picker.showSelectedOnlyInList)
                      picker.toggleSelectedOnlyInList()
                  }}
                >
                  Selecionados ({picker.draftValue.length})
                </button>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={picker.isPending || picker.options.length === 0}
                  onClick={picker.selectAllCollectionPointIds}
                >
                  Selecionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={picker.draftValue.length === 0}
                  onClick={picker.clearDraftSelection}
                >
                  Limpar seleção
                </Button>
              </div>

              {/* Indicadores de busca */}
              {picker.listBuckets.hasActiveSearch ? (
                <Badge variant="outline" className="w-fit font-normal">
                  {picker.displayedOutsideCount}/
                  {picker.listBuckets.outsideCount} fora da área visível
                </Badge>
              ) : null}

              {picker.hasMoreListResults ? (
                <p className="text-xs text-muted-foreground">
                  Mostrando{' '}
                  {picker.showSelectedOnlyInList
                    ? picker.displayedSelectedCount
                    : picker.filteredOptions.length}{' '}
                  de{' '}
                  {picker.showSelectedOnlyInList
                    ? picker.listBuckets.selectedCount
                    : picker.filteredOptions.length}{' '}
                  radares.
                </p>
              ) : null}

              {/* Lista virtualizada */}
              <div
                ref={picker.listViewportRef}
                className="h-[320px] overflow-y-auto pr-1 sm:h-[430px] sm:pr-3"
                onScroll={picker.handleListScroll}
              >
                {picker.filteredOptions.length > 0 ? (
                  <div
                    className="relative"
                    style={{ height: picker.virtualRange.totalHeight }}
                  >
                    <div
                      className="absolute left-0 right-0 flex flex-col gap-1.5"
                      style={{
                        transform: `translateY(${picker.virtualRange.topPadding}px)`,
                      }}
                    >
                      {picker.virtualRange.items.map((option) => {
                        const selected = picker.draftValue.includes(
                          option.value,
                        )
                        const point = picker.collectionPointsById.get(
                          option.value,
                        )

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={cn(
                              'flex w-full items-start gap-3 rounded-md border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/30',
                              selected &&
                                'border-primary/40 bg-primary/5 hover:bg-primary/10',
                              picker.focusedPointId === option.value &&
                                'ring-1 ring-primary',
                            )}
                            onClick={() => {
                              if (!point) return
                              picker.togglePointFromMapOrList(point)
                            }}
                          >
                            {/* Checkbox visual */}
                            <div
                              className={cn(
                                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                                selected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40',
                              )}
                            >
                              {selected ? <Check className="h-3 w-3" /> : null}
                            </div>

                            {/* Dados do radar */}
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold text-foreground">
                                {point?.cetRioCode ?? option.label}
                              </div>
                              {point?.location ? (
                                <div className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                                  {point.location}
                                </div>
                              ) : null}
                              {point?.district || point?.direction ? (
                                <div className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                                  {[point?.district, point?.direction]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </div>
                              ) : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    {picker.showSelectedOnlyInList
                      ? 'Nenhum radar selecionado.'
                      : 'Nenhum ponto encontrado.'}
                  </div>
                )}
              </div>

              {/* Rodapé */}
              <div className="flex flex-col-reverse gap-2 border-t pb-3 pt-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={picker.closePicker}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={picker.handleApply}
                  disabled={disabled || picker.isPending}
                >
                  Confirmar seleção
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Botão para abrir o picker quando monitorAll=false e picker fechado */}
      {!monitorAll && !picker.expanded ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start text-xs"
          disabled={disabled || picker.isPending}
          onClick={picker.openPicker}
        >
          {picker.value.length > 0
            ? `${picker.value.length} radar(es) selecionado(s) — editar`
            : 'Buscar e selecionar radares'}
        </Button>
      ) : null}
    </div>
  )
}
