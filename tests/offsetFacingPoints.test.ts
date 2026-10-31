import { expect, test } from "bun:test"
import { calculateElbow } from "lib/index"

test("offset points facing each other retain orthogonal bends", () => {
  const scene = {
    point1: { x: 0, y: 0, facingDirection: "x+" },
    point2: { x: 100, y: 1, facingDirection: "x-" },
  } as const

  const result = calculateElbow(scene.point1, scene.point2, { overshoot: 20 })
  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 1 },
    { x: 100, y: 1 },
  ])
  expect(calculateElbow(scene.point2, scene.point1, { overshoot: 20 })).toEqual(
    result.toReversed(),
  )
})

test("offset points facing away retain an orthogonal final segment", () => {
  const scene = {
    point1: { x: 0, y: 0, facingDirection: "x-" },
    point2: { x: 100, y: 1, facingDirection: "x+" },
  } as const

  const result = calculateElbow(scene.point1, scene.point2, { overshoot: 20 })
  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: -20, y: 0 },
    { x: -20, y: 20 },
    { x: 120, y: 20 },
    { x: 120, y: 1 },
    { x: 100, y: 1 },
  ])
  expect(calculateElbow(scene.point2, scene.point1, { overshoot: 20 })).toEqual(
    result.toReversed(),
  )
})

test("offset vertically facing points retain orthogonal bends", () => {
  const scene = {
    point1: { x: 0, y: 0, facingDirection: "y+" },
    point2: { x: 1, y: 100, facingDirection: "y-" },
  } as const

  const result = calculateElbow(scene.point1, scene.point2, { overshoot: 20 })
  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 1, y: 50 },
    { x: 1, y: 100 },
  ])
})

test("exactly aligned facing points keep the direct path", () => {
  const scene = {
    point1: { x: 0, y: 0, facingDirection: "x+" },
    point2: { x: 100, y: 0, facingDirection: "x-" },
  } as const

  expect(calculateElbow(scene.point1, scene.point2, { overshoot: 20 })).toEqual(
    [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  )
})
