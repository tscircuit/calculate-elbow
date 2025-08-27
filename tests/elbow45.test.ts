import { test, expect } from "bun:test"
import { calculateElbow } from "lib/index"

const scene = {
  point1: {
    x: -3.5512907000000005,
    y: 0.0002732499999993365,
    facingDirection: "x-",
  },
  point2: {
    x: 2.4487906999999995,
    y: -0.00027334999999961695,
    facingDirection: "x-",
  },
} as const

test("elbow45", () => {
  const result = calculateElbow(scene.point1, scene.point2, {
    overshoot: 0.2,
  })
  console.log(result)
})
