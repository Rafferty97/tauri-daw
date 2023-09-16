import { createEffect, onCleanup } from 'solid-js'
import { Point, p } from '../util/geometry'
import { v4 as uuid } from 'uuid'
import { Unit, formatUnit, unitIsLogarithmic } from '../util/unit'

export interface DialProps {
  minValue: number
  maxValue: number
  unit?: Unit
  decimals?: number
  center?: boolean
  value: number
  onInput?: (value: number) => any
}

export function Dial(props: DialProps) {
  const id = uuid()
  let sv: number | undefined
  let sy: number | undefined

  const onMouseDown = (ev: MouseEvent) => {
    sv = frac()
    sy = ev.pageY
  }

  const minAngle = -0.8 * Math.PI
  const maxAngle = 0.8 * Math.PI
  const baseAngle = () => (props.center ? 0 : minAngle)
  const isLogarithmic = () => unitIsLogarithmic(props.unit ?? '')
  const frac = () => {
    if (isLogarithmic()) {
      const min = Math.log(props.minValue)
      const max = Math.log(props.maxValue)
      return (Math.log(props.value) - min) / (max - min)
    } else {
      const min = props.minValue
      const max = props.maxValue
      return (props.value - min) / (max - min)
    }
  }
  const currAngle = () => 0.8 * Math.PI * (2 * frac() - 1)
  const currAngleDeg = () => 0.8 * 180 * (2 * frac() - 1)

  const valueFromFrac = (frac: number) => {
    if (isLogarithmic()) {
      const min = Math.log(props.minValue)
      const max = Math.log(props.maxValue)
      return Math.exp(min + frac * (max - min))
    } else {
      const min = props.minValue
      const max = props.maxValue
      return min + frac * (max - min)
    }
  }

  createEffect(() => {
    const onMouseMove = (ev: MouseEvent) => {
      if (sv != null && sy != null) {
        const newFrac = Math.min(Math.max(sv + 0.01 * (sy - ev.pageY), 0), 1)
        props.onInput?.(valueFromFrac(newFrac))
      }
    }
    const onMouseUp = () => {
      sy = undefined
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    onCleanup(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })
  })

  return (
    <div
      style={{
        position: 'relative',
        width: '50px',
        height: '60px',
        background: '#bbb',
        'user-select': 'none',
      }}
      onMouseDown={onMouseDown}
    >
      <svg height="100%" width="100%">
        <mask id={`${id}-track-mask`}>
          <path d={radialMask([25, 25], 20, minAngle, maxAngle)} fill="white" />
        </mask>
        <mask id={`${id}-fill-mask`}>
          <path d={radialMask([25, 25], 20, baseAngle(), currAngle())} fill="white" />
        </mask>
        <circle
          cx="25"
          cy="25"
          r="16"
          stroke="#222"
          stroke-width="3"
          fill="transparent"
          mask={`url(#${id}-track-mask)`}
        />
        <path d={radialMask([25, 25], 20, baseAngle(), currAngle())} fill="#bbb" />
        <circle
          cx="25"
          cy="25"
          r="16"
          stroke="cyan"
          stroke-width="3"
          fill="transparent"
          mask={`url(#${id}-fill-mask)`}
        />
        <rect
          transform={`translate(25 25) rotate(${180 + currAngleDeg()})`}
          x="-2.5"
          y="-2.5"
          width="5"
          height="22"
          fill="#bbb"
        />
        <rect
          transform={`translate(25 25) rotate(${180 + currAngleDeg()})`}
          x="-1.5"
          y="-1.5"
          width="3"
          height="20"
          rx={1}
          ry={1}
          fill="black"
        />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, 'text-align': 'center', 'font-size': '10px' }}>
        {formatUnit(props.value, props.unit, props.decimals)}
      </div>
    </div>
  )
}

/**
 * Creates a mask for creating arcs from cirlces.
 * @param c The centre point
 * @param r The radius
 * @param a1 The start angle, between -PI and PI
 * @param a2 The end angle, between -PI and PI
 */
function radialMask(c: Point, r: number, a1: number, a2: number) {
  if (a1 > a2) {
    ;[a2, a1] = [a1, a2]
  }

  let firstPoint, firstIdx
  if (a1 < -0.75 * Math.PI) {
    firstIdx = 0
    firstPoint = p.add(c, [r * Math.tan(-a1 + Math.PI), r])
  } else if (a1 < -0.25 * Math.PI) {
    firstIdx = 1
    firstPoint = p.add(c, [-r, r * Math.tan(-a1 + 0.5 * Math.PI)])
  } else if (a1 < 0.25 * Math.PI) {
    firstIdx = 2
    firstPoint = p.add(c, [r * Math.tan(a1), -r])
  } else if (a1 < 0.75 * Math.PI) {
    firstIdx = 3
    firstPoint = p.add(c, [r, r * Math.tan(a1 - 0.5 * Math.PI)])
  } else {
    firstIdx = 4
    firstPoint = p.add(c, [r * Math.tan(-a1 - Math.PI), r])
  }

  let lastPoint, lastIdx
  if (a2 < -0.75 * Math.PI) {
    lastIdx = 0
    lastPoint = p.add(c, [r * Math.tan(-a2 + Math.PI), r])
  } else if (a2 < -0.25 * Math.PI) {
    lastIdx = 1
    lastPoint = p.add(c, [-r, r * Math.tan(-a2 + 0.5 * Math.PI)])
  } else if (a2 < 0.25 * Math.PI) {
    lastIdx = 2
    lastPoint = p.add(c, [r * Math.tan(a2), -r])
  } else if (a2 < 0.75 * Math.PI) {
    lastIdx = 3
    lastPoint = p.add(c, [r, r * Math.tan(a2 - 0.5 * Math.PI)])
  } else {
    lastIdx = 4
    lastPoint = p.add(c, [r * Math.tan(-a2 - Math.PI), r])
  }

  const points = [c]
  points.push(firstPoint)
  if (firstIdx <= 0 && lastIdx > 0) points.push(p.add(c, [-r, r]))
  if (firstIdx <= 1 && lastIdx > 1) points.push(p.add(c, [-r, -r]))
  if (firstIdx <= 2 && lastIdx > 2) points.push(p.add(c, [r, -r]))
  if (firstIdx <= 3 && lastIdx > 3) points.push(p.add(c, [r, r]))
  points.push(lastPoint)

  return `M${points.map(p => p.join(',')).join('L')}Z`
  // return 'M25,25L50,50L0,50Z'
}
