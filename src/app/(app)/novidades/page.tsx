'use client'

import { Card } from './components/card'
import { changelog } from './components/changelog'

export default function Novidades() {
  return (
    <div className="page-content overflow-y-scroll">
      <div className="markdown">
        <h1>Histórico de Atualizações</h1>
        <p>
          Este documento registra todas as novas atualizações mais relevantes do
          projeto CIVITAS perceptíveis ao usuário final.
        </p>

        {changelog.map((cardProps, index) => (
          <Card key={index} {...cardProps} />
        ))}
      </div>
    </div>
  )
}
