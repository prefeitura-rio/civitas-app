'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import type { MapViewState } from '@deck.gl/core'
import { DeckGL } from 'deck.gl'
import { Check, Crosshair, MapPin, Navigation, Search } from 'lucide-react'
import MapGl, { type ViewStateChangeEvent } from 'react-map-gl'

import { MAPBOX_ACCESS_TOKEN } from '@/app/(app)/veiculos/components/map/components/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { useCollectionPointPickerState } from './use-collection-point-picker-state'

type PickerState = ReturnType<typeof useCollectionPointPickerState>

interface CollectionPointPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  picker: PickerState
  disabled?: boolean
}

export function CollectionPointPickerDialog({
  open,
  onOpenChange,
  picker,
  disabled = false,
}: CollectionPointPickerDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      picker.closePicker()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(92vh,900px)] w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-4 pr-12 text-left sm:px-6">
          <DialogTitle>Selecionar equipamentos de LPR</DialogTitle>
          <DialogDescription>
            Clique no mapa ou na lista para marcar pontos. Confirme para aplicar
            a seleção ao vínculo.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
            <div className="flex min-h-0 flex-col gap-3">
              <div className="rounded-md border bg-muted/10 p-2">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mapa</p>
                    <p className="text-xs text-muted-foreground">
                      Clique para selecionar equipamentos de LPR. Botão direito
                      para ver detalhes. Use &quot;Selecionar por área&quot;
                      para marcar múltiplos de uma vez.
                    </p>
                  </div>

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

                <div
                  ref={picker.mapContainerRef}
                  className="relative h-[360px] overflow-hidden rounded-md border sm:h-[420px] xl:h-[520px]"
                  onContextMenu={picker.handleMapContextMenu}
                >
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
                        Desative &quot;Focar selecionados&quot; para desenhar
                        uma área no mapa.
                      </p>
                    ) : picker.areaSelectionMode ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Clique no mapa para marcar os vértices. Use
                        &quot;Confirmar área&quot; ao terminar o contorno.
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
                    <div className="flex h-[360px] items-center justify-center px-6 text-center text-sm text-muted-foreground sm:h-[420px] xl:h-[520px]">
                      Nenhum ponto disponível para este filtro.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3 rounded-md border bg-muted/20 px-3 pb-3 pt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Radares</p>
                <Badge variant="secondary" className="font-normal">
                  {picker.draftValue.length} selecionado(s)
                </Badge>
              </div>

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

              <div
                ref={picker.listViewportRef}
                className="h-[280px] overflow-y-auto pr-1 sm:h-[360px] xl:h-[420px]"
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
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-4 py-4 sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={picker.handleApply}
            disabled={disabled || picker.isPending}
          >
            Confirmar seleção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
