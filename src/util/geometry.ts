export type Point = [number, number]

export const p = {
  add(a: Point, b: Point): Point {
    return [a[0] + b[0], a[1] + b[1]]
  },
  sub(a: Point, b: Point): Point {
    return [a[0] - b[0], a[1] - b[1]]
  },
  mul(a: Point, s: number): Point {
    return [s * a[0], s * a[1]]
  },
}
