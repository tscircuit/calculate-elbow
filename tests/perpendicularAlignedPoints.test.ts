import { expect, test } from "bun:test"
import { calculateElbow, type ElbowPoint } from "lib/index"

type DirectedPoint = Required<ElbowPoint>

const directionVectors = {
  "x+": { x: 1, y: 0 },
  "x-": { x: -1, y: 0 },
  "y+": { x: 0, y: 1 },
  "y-": { x: 0, y: -1 },
}

const expectDirectedPath = (
  path: Array<{ x: number; y: number }>,
  start: DirectedPoint,
  end: DirectedPoint,
) => {
  expect(path[0]).toEqual({ x: start.x, y: start.y })
  expect(path.at(-1)).toEqual({ x: end.x, y: end.y })
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1]!
    const to = path[i]!
    expect(from.x === to.x || from.y === to.y).toBe(true)
    expect(from.x !== to.x || from.y !== to.y).toBe(true)
  }
  expect({
    x: Math.sign(path[1]!.x - start.x),
    y: Math.sign(path[1]!.y - start.y),
  }).toEqual(directionVectors[start.facingDirection])
  expect({
    x: Math.sign(path.at(-2)!.x - end.x),
    y: Math.sign(path.at(-2)!.y - end.y),
  }).toEqual(directionVectors[end.facingDirection])
}

test("close equal-Y perpendicular endpoints retain the vertical terminal segment", () => {
  const start = { x: 0, y: 0, facingDirection: "x+" } as const
  const end = { x: 1, y: 0, facingDirection: "y-" } as const

  const result = calculateElbow(start, end, { overshoot: 20 })

  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: -20 },
    { x: 1, y: -20 },
    { x: 1, y: 0 },
  ])
  expectDirectedPath(result, start, end)
})

test("rotated and reflected perpendicular endpoints preserve directions and input order", () => {
  const scenes: Array<[DirectedPoint, DirectedPoint]> = [
    [
      { x: 0, y: 0, facingDirection: "x+" },
      { x: 1, y: 0, facingDirection: "y-" },
    ],
    [
      { x: 0, y: 0, facingDirection: "x-" },
      { x: -1, y: 0, facingDirection: "y-" },
    ],
    [
      { x: 0, y: 0, facingDirection: "x+" },
      { x: 1, y: 0, facingDirection: "y+" },
    ],
    [
      { x: 0, y: 0, facingDirection: "x-" },
      { x: -1, y: 0, facingDirection: "y+" },
    ],
    [
      { x: 0, y: 0, facingDirection: "y+" },
      { x: 0, y: 1, facingDirection: "x+" },
    ],
    [
      { x: 0, y: 0, facingDirection: "y-" },
      { x: 0, y: -1, facingDirection: "x-" },
    ],
    [
      { x: 0, y: 0, facingDirection: "y+" },
      { x: 0, y: 1, facingDirection: "x-" },
    ],
    [
      { x: 0, y: 0, facingDirection: "y-" },
      { x: 0, y: -1, facingDirection: "x+" },
    ],
  ]
  for (const [originalStart, originalEnd] of scenes) {
    const start = {
      ...originalStart,
      x: originalStart.x + 10,
      y: originalStart.y - 20,
    }
    const end = { ...originalEnd, x: originalEnd.x + 10, y: originalEnd.y - 20 }
    const result = calculateElbow(start, end, { overshoot: 20 })
    expectDirectedPath(result, start, end)
    const reversed = calculateElbow(end, start, { overshoot: 20 })
    expectDirectedPath(reversed, end, start)
    expect(reversed).toEqual(result.toReversed())
  }
})

test("perpendicular directions survive both alignment thresholds", () => {
  for (const { overshoot, gaps } of [
    { overshoot: 20, gaps: [1, 2, 3] },
    { overshoot: 0.000001, gaps: [0.0000005, 0.000001, 0.000002] },
  ]) {
    for (const gap of gaps) {
      const start = { x: 0, y: 0, facingDirection: "x+" } as const
      const end = { x: gap, y: 0, facingDirection: "y-" } as const
      expectDirectedPath(calculateElbow(start, end, { overshoot }), start, end)
    }
  }
})

test("nonzero-Y aligned perpendicular routes retain their existing bends", () => {
  const start = { x: 0, y: 0, facingDirection: "x+" } as const
  for (const y of [-1, 1]) {
    const end = { x: 1, y, facingDirection: "y-" } as const
    const bendY = y > 0 ? 0.5 : -21
    const result = calculateElbow(start, end, { overshoot: 20 })
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: bendY },
      { x: 1, y: bendY },
      { x: 1, y },
    ])
    expectDirectedPath(result, start, end)
  }
})

test("coincident perpendicular endpoints retain both directions with positive overshoot", () => {
  const start = { x: 0, y: 0, facingDirection: "x+" } as const
  const end = { x: 0, y: 0, facingDirection: "y-" } as const
  expectDirectedPath(calculateElbow(start, end, { overshoot: 20 }), start, end)
})

test("explicit zero overshoot preserves existing shared-axis paths", () => {
  const start = { x: 0, y: 0, facingDirection: "x+" } as const
  for (const x of [0, 1]) {
    const end = { x, y: 0, facingDirection: "y-" } as const
    expect(calculateElbow(start, end, { overshoot: 0 })).toEqual(
      x === 0
        ? [{ x: 0, y: 0 }]
        : [
            { x: 0, y: 0 },
            { x, y: 0 },
          ],
    )
  }
})

test("endpoints without direction constraints keep their shared-axis route", () => {
  expect(
    calculateElbow({ x: 0, y: 0 }, { x: 1, y: 0 }, { overshoot: 20 }),
  ).toEqual([
    { x: 0, y: 0 },
    { x: 0.5, y: 0 },
    { x: 1, y: 0 },
  ])
})
