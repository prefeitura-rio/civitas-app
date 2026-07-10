import 'mapbox-gl/dist/mapbox-gl.css'

import type { MapViewState } from '@deck.gl/core'
import { DeckGL } from 'deck.gl'
import {
  ChevronDown,
  ChevronRight,
  Crosshair,
  ListFilter,
  MapPin,
  Navigation,
  Search,
} from 'lucide-react'
import MapGl from 'react-map-gl'

import { MAPBOX_ACCESS_TOKEN } from '@/app/(app)/veiculos/components/map/components/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { useCollectionPointPickerState } from './use-collection-point-picker-state'

interface MonitoredPlateAuthorityCollectionPointMultiSelectProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  showSelectAllCollectionPoints?: boolean
}

export function MonitoredPlateAuthorityCollectionPointMultiSelect({
  label = 'Pontos de coleta',
  description = 'Selecione radares apenas se este vinculo nao valer para todos os pontos de coleta.',
  value,
  onChange,
  disabled = false,
  showSelectAllCollectionPoints = false,
}: MonitoredPlateAuthorityCollectionPointMultiSelectProps) {
  const picker = useCollectionPointPickerState({ value, onChange })
  const showCompactAllSummary =
    showSelectAllCollectionPoints &&
    picker.allSelected &&
    picker.options.length > 0

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

      <div className="rounded-md border border-border bg-muted/30 px-3 py-3">
        <div className="flex flex-col gap-3">
          {showCompactAllSummary ? (
            <p className="text-sm text-foreground">
              Todos os pontos de coleta selecionados.
            </p>
          ) : picker.selectedOptions.length > 0 ? (
            <>
              <p className="text-sm text-foreground">
                {picker.selectedOptions.length} radares selecionados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {picker.selectedOptions.slice(0, 6).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="max-w-full"
                    disabled={disabled || picker.isPending}
                    onClick={() =>
                      picker.openPickerWithSelectedList(option.value)
                    }
                  >
                    <Badge
                      variant="outline"
                      className="max-w-full truncate px-2 py-1 text-xs font-normal hover:bg-accent"
                    >
                      {picker.collectionPointsById.get(option.value)
                        ?.cetRioCode ?? option.label}
                    </Badge>
                  </button>
                ))}
                {picker.selectedOptions.length > 6 ? (
                  <button
                    type="button"
                    className="max-w-full"
                    disabled={disabled || picker.isPending}
                    onClick={() => picker.openPickerWithSelectedList()}
                  >
                    <Badge
                      variant="outline"
                      className="px-2 py-1 text-xs font-normal text-muted-foreground hover:bg-accent"
                    >
                      +{picker.selectedOptions.length - 6}
                    </Badge>
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum radar selecionado.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={disabled || picker.isPending}
              onClick={picker.toggleExpanded}
            >
              {picker.expanded
                ? 'Fechar busca de radares'
                : 'Buscar e selecionar radares'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={disabled || picker.isPending || value.length === 0}
              onClick={picker.clearCommittedSelection}
            >
              Limpar selecao
            </Button>
          </div>
        </div>
      </div>

      {picker.expanded ? (
        <div className="min-w-0 rounded-lg border bg-background p-4">
          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(21rem,0.9fr)]">
            <div className="flex min-h-0 flex-col gap-3">
              <div className="rounded-md border bg-muted/10 p-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mapa</p>
                    <p className="text-xs text-muted-foreground">
                      Clique com o botao esquerdo para selecionar. Clique com o
                      botao direito para ver os detalhes do radar.
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
                        ? 'Mostrar todos no mapa'
                        : 'Mostrar so selecionados'}
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
                      Ajustar aos selecionados
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={picker.mapPoints.length === 0}
                      onClick={picker.fitMapPoints}
                    >
                      Ajustar ao mapa
                    </Button>
                  </div>
                </div>
                <div
                  ref={picker.mapContainerRef}
                  className="relative h-[620px] overflow-hidden rounded-md border"
                  onContextMenu={picker.handleMapContextMenu}
                >
                  <div className="absolute right-3 top-3 z-10 w-80">
                    <div className="rounded-md border bg-background/95 p-2 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-2">
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
                          placeholder="Buscar rua ou endereco no mapa"
                          className="h-8"
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
                          {picker.isMapSearchLoading ? 'Buscando' : 'Ir'}
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
                                    'Endereco',
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
                  </div>

                  {picker.mapPoints.length > 0 ? (
                    <DeckGL
                      ref={picker.deckRef}
                      style={{ width: '100%', height: '100%' }}
                      controller
                      viewState={picker.viewState}
                      layers={[picker.pointLayer]}
                      onClick={picker.handleMapBackgroundClick}
                      onViewStateChange={({ viewState: nextViewState }) => {
                        picker.handleViewStateChange(
                          nextViewState as MapViewState,
                        )
                      }}
                      getCursor={() => 'pointer'}
                    >
                      <MapGl
                        mapStyle="mapbox://styles/mapbox/light-v11"
                        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
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
                                Codigo
                              </span>
                              <p className="text-sm font-semibold text-foreground">
                                {picker.popupState.point.cetRioCode}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Localizacao
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {picker.popupState.point.location ||
                                  'Nao informado'}
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
                                  'Nao informado'}
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
                                  'Nao informado'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </DeckGL>
                  ) : (
                    <div className="flex h-[620px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      Nenhum ponto disponivel para este filtro.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3 rounded-md border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Buscar radares
                </p>
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
                      ? 'Carregando pontos...'
                      : 'Buscar por codigo, local, bairro ou faixa'
                  }
                  disabled={picker.isPending}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {picker.listBuckets.hasActiveSearch ? (
                  <Badge variant="outline" className="font-normal">
                    {picker.displayedOutsideCount}/
                    {picker.listBuckets.outsideCount} fora da area
                  </Badge>
                ) : null}
              </div>

              {picker.showSelectedOnlyInList && picker.hasMoreListResults ? (
                <div className="rounded-md border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground">
                  Mostrando {picker.displayedSelectedCount} radares
                  selecionados.
                </div>
              ) : null}

              {!picker.showSelectedOnlyInList &&
              picker.listBuckets.hasActiveSearch &&
              picker.hasMoreListResults ? (
                <div className="rounded-md border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground">
                  Mostrando {picker.filteredOptions.length} resultados da busca.
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {showSelectAllCollectionPoints ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={picker.isPending || picker.options.length === 0}
                    onClick={picker.selectAllCollectionPointIds}
                  >
                    Selecionar todos os pontos
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={
                    picker.showSelectedOnlyInList ? 'secondary' : 'outline'
                  }
                  size="sm"
                  className="h-8 text-xs"
                  disabled={picker.draftValue.length === 0}
                  onClick={picker.toggleSelectedOnlyInList}
                >
                  <ListFilter className="mr-1 h-3.5 w-3.5" />
                  {picker.showSelectedOnlyInList
                    ? 'Ver todos'
                    : 'Ver selecionados'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={picker.draftValue.length === 0}
                  onClick={picker.clearDraftSelection}
                >
                  Limpar rascunho
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {picker.draftSelectedOptions.length} selecionado(s)
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {picker.mapPoints.length} no mapa
                </Badge>
                {picker.search.trim() ? (
                  <Badge variant="outline" className="font-normal">
                    busca ativa
                  </Badge>
                ) : null}
              </div>

              {picker.selectedListRows.length > 0 &&
              !picker.showSelectedOnlyInList ? (
                <div className="rounded-md border bg-background p-2">
                  <button
                    type="button"
                    className="flex h-6 w-full items-center justify-between gap-2 text-left"
                    onClick={picker.toggleSelectedSection}
                  >
                    <div className="flex h-6 items-center gap-2">
                      {picker.showSelectedSection ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="inline-flex h-6 items-center text-xs font-medium leading-none text-foreground">
                        Selecionados
                      </span>
                      <Badge
                        variant="outline"
                        className="inline-flex h-5 min-w-5 items-center justify-center self-center rounded-full px-1.5 text-[10px] font-normal leading-none"
                      >
                        {picker.selectedListRows.length}
                      </Badge>
                    </div>
                    <span className="inline-flex h-6 items-center text-[11px] text-muted-foreground">
                      {picker.showSelectedSection ? 'Ocultar' : 'Ver'}
                    </span>
                  </button>
                  {picker.showSelectedSection ? (
                    <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {picker.selectedListRows.map((point) => {
                        return (
                          <button
                            key={point.cetRioCode}
                            type="button"
                            className={cn(
                              'flex w-full items-start justify-between gap-2 rounded-md border bg-primary/5 px-3 py-2 text-left transition-colors hover:bg-primary/10',
                              picker.focusedPointId === point.cetRioCode &&
                                'ring-1 ring-primary',
                            )}
                            onClick={() => picker.previewPoint(point)}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold text-foreground">
                                {point.cetRioCode}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                Localizacao: {point.location || 'Nao informado'}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                Bairro: {point.district || 'Nao informado'}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                Sentido: {point.direction || 'Nao informado'}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge variant="default" className="text-[10px]">
                                Selecionado
                              </Badge>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  picker.togglePointFromMapOrList(point)
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div
                ref={picker.listViewportRef}
                className="h-[430px] overflow-y-auto pr-3"
                onScroll={picker.handleListScroll}
              >
                {picker.filteredOptions.length > 0 ? (
                  <div
                    className="relative"
                    style={{ height: picker.virtualRange.totalHeight }}
                  >
                    <div
                      className="absolute left-0 right-0 flex flex-col gap-2"
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
                              'min-h-[84px] rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-muted/30',
                              selected && 'border-primary/40 bg-primary/5',
                              picker.focusedPointId === option.value &&
                                'ring-1 ring-primary',
                            )}
                            onClick={() => {
                              if (!point) return
                              picker.previewPoint(point)
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-foreground">
                                  {picker.collectionPointsById.get(option.value)
                                    ?.cetRioCode ?? option.label}
                                </div>
                                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                  Localizacao:{' '}
                                  {point?.location || 'Nao informado'}
                                </div>
                                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                  Bairro: {point?.district || 'Nao informado'}
                                </div>
                                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                                  Sentido: {point?.direction || 'Nao informado'}
                                </div>
                              </div>
                              {selected ? (
                                <Badge variant="default" className="shrink-0">
                                  Selecionado
                                </Badge>
                              ) : null}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={selected ? 'secondary' : 'default'}
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  picker.toggleDraftId(option.value)
                                }}
                              >
                                {selected
                                  ? 'Remover da selecao'
                                  : 'Selecionar radar'}
                              </Button>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    Nenhum ponto encontrado.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={picker.closePicker}
                >
                  Fechar sem aplicar
                </Button>
                <Button
                  type="button"
                  onClick={picker.handleApply}
                  disabled={disabled || picker.isPending}
                >
                  Aplicar selecao
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
