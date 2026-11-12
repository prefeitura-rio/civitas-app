import type { Options } from 'vis-network'

import { LAYOUT_ITERATIONS } from '@/modules/vehicle-intelligence/features/correlations/network-layout'
import { sansFontFamily } from '@/modules/vehicle-intelligence/lib/fonts'

/** Opções da rede: grupos de cor dos nós, física (desligada até organizar) e interação. */
export function networkOptions(): Options {
  return {
    autoResize: true,
    nodes: {
      shape: 'dot',
      borderWidth: 1.5,
      borderWidthSelected: 4,
      font: {
        face: sansFontFamily(),
        color: '#f3f7f8',
        size: 13,
        strokeWidth: 5,
        strokeColor: 'rgba(15,17,17,.92)',
      },
      scaling: {
        min: 10,
        max: 44,
        label: { enabled: true, min: 11, max: 18, drawThreshold: 8 },
      },
    },
    groups: {
      candidateNew: {
        color: {
          background: '#bd263a',
          border: '#f07c88',
          highlight: { background: '#d93549', border: '#ffffff' },
        },
      },
      candidateKnown: {
        color: {
          background: '#a46c12',
          border: '#f4c36a',
          highlight: { background: '#c78316', border: '#ffffff' },
        },
      },
      authorCited: {
        color: {
          background: '#8f3154',
          border: '#ffb3cb',
          highlight: { background: '#a83a63', border: '#ffffff' },
        },
      },
      candidateClone: {
        color: {
          background: '#643f80',
          border: '#d5a7f2',
          highlight: { background: '#8155a1', border: '#ffffff' },
        },
      },
      candidateCloneConfirmed: {
        color: {
          background: '#6d28d9',
          border: '#f3e8ff',
          highlight: { background: '#7c3aed', border: '#ffffff' },
        },
      },
      anchor: {
        color: {
          background: '#075ea8',
          border: '#73aee8',
          highlight: { background: '#0b75c9', border: '#ffffff' },
        },
      },
    },
    edges: { selectionWidth: 2, hoverWidth: 1.5, shadow: false },
    physics: {
      enabled: false,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -68,
        centralGravity: 0.018,
        springLength: 175,
        springConstant: 0.032,
        damping: 0.62,
        avoidOverlap: 0.9,
      },
      stabilization: {
        enabled: false,
        iterations: LAYOUT_ITERATIONS,
        updateInterval: 10,
        fit: false,
      },
    },
    interaction: {
      hover: true,
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false,
      navigationButtons: true,
      keyboard: { enabled: true, bindToWindow: false },
      tooltipDelay: 100,
      selectConnectedEdges: true,
      hoverConnectedEdges: true,
      multiselect: false,
    },
    layout: { improvedLayout: false, randomSeed: 17 },
  }
}
