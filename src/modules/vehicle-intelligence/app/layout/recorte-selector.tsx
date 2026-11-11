import { Fragment } from 'react'

import { switchRecorte } from '@/modules/vehicle-intelligence/app/navigation'
import {
  recorteAtual,
  RECORTES,
} from '@/modules/vehicle-intelligence/config/recortes'

/** Os recortes do banco principal e, depois de um divisor, os do modo experimental (banco experimental, ROs do ISP). */
export function RecorteSelector() {
  const primeiroExperimental = RECORTES.findIndex((item) => item.experimental)
  return (
    <div className="recorte-switcher">
      <span className="recorte-switcher-label">Recorte</span>
      <div
        className="recorte-segments"
        role="group"
        aria-label="Selecionar recorte"
      >
        {RECORTES.map((item, index) => (
          <Fragment key={item.id}>
            {index === primeiroExperimental && (
              <span
                className="recorte-divisor"
                title="Modo experimental: banco à parte, com os ROs do ISP"
              >
                Experimental
              </span>
            )}
            <button
              type="button"
              className={item.id === recorteAtual ? 'active' : ''}
              aria-pressed={item.id === recorteAtual}
              title={
                item.experimental ? `${item.title} (experimental)` : undefined
              }
              onClick={() => switchRecorte(item.id)}
            >
              {item.label}
              {item.experimental && (
                <span className="recorte-experimental">exp.</span>
              )}
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
