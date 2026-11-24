import { expect, test } from "bun:test"
import { calculateElbow, type ElbowPoint } from "lib/index"

test("elbow46: nearly aligned opposite facings stay axis aligned", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 4, y: 0.05, facingDirection: "x-" }

  const result = calculateElbow(point1, point2, { overshoot: 1 })

  // The y difference is inside the alignment tolerance but nonzero, so a
  // straight route would emit a diagonal segment and skip both facings.
  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0.05 },
    { x: 3, y: 0.05 },
    { x: 4, y: 0.05 },
  ])
})

test("elbow46: coincident x with nearly aligned y stays axis aligned", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 0, y: 0.4, facingDirection: "x-" }

  const result = calculateElbow(point1, point2, { overshoot: 5 })

  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 5 },
    { x: -5, y: 5 },
    { x: -5, y: 0.4 },
    { x: 0, y: 0.4 },
  ])
})

test("elbow46: exactly aligned opposite facings stay a straight line", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 4, y: 0, facingDirection: "x-" }

  const result = calculateElbow(point1, point2, { overshoot: 1 })

  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ])
})
