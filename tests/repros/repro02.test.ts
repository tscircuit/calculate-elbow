import { expect, test } from "bun:test"
import { calculateElbow } from "lib/index"

test("near-aligned perpendicular endpoints route consistently", () => {
  const result = calculateElbow(
    {
      x: -2.025,
      y: 2.000000000000001,
      facingDirection: "y+",
    },
    {
      x: -1.1099999999999999,
      y: 2.0000000000000018,
      facingDirection: "x-",
    },
    {
      overshoot: 0.2,
    },
  )

  expect(result).toEqual([
    {
      x: -2.025,
      y: 2.000000000000001,
    },
    {
      x: -2.025,
      y: 2.200000000000001,
    },
    {
      x: -1.3099999999999998,
      y: 2.200000000000001,
    },
    {
      x: -1.3099999999999998,
      y: 2.000000000000001,
    },
    {
      x: -1.1099999999999999,
      y: 2.0000000000000018,
    },
  ])
})
