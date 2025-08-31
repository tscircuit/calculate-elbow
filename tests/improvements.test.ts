import { test, expect } from "bun:test"
import { calculateElbow, type ElbowPoint } from "../lib"

test("performance optimization - floating point comparison", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 1, y: 1, facingDirection: "y+" }
  
  // Test with very small floating point differences
  const result = calculateElbow(point1, point2, { overshoot: 0.1 })
  
  // Should not have duplicate points due to floating point precision
  expect(result.length).toBeGreaterThan(1)
  
  // Check for no consecutive duplicate points
  for (let i = 0; i < result.length - 1; i++) {
    const current = result[i]!
    const next = result[i + 1]!
    expect(current.x !== next.x || current.y !== next.y).toBe(true)
  }
})

test("fixed edge case - x+ to x- with same y and p2.x > p1.x", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 2, y: 0, facingDirection: "x-" }
  
  const result = calculateElbow(point1, point2, { overshoot: 0.5 })
  
  // Should create a path that goes up, over, and down
  expect(result).toEqual([
    { x: 0, y: 0 },
    { x: 0.5, y: 0 },      // p1 overshoot
    { x: 0.5, y: 0.5 },    // up
    { x: 1.5, y: 0.5 },    // over
    { x: 1.5, y: 0 },      // down
    { x: 2, y: 0 }         // final position
  ])
})

test("input validation - negative overshoot", () => {
  const point1: ElbowPoint = { x: 0, y: 0 }
  const point2: ElbowPoint = { x: 1, y: 1 }
  
  expect(() => {
    calculateElbow(point1, point2, { overshoot: -1 })
  }).toThrow("overshootAmount must be non-negative")
})

test("input validation - infinite coordinates", () => {
  const point1: ElbowPoint = { x: Infinity, y: 0 }
  const point2: ElbowPoint = { x: 1, y: 1 }
  
  expect(() => {
    calculateElbow(point1, point2)
  }).toThrow("All coordinates must be finite numbers")
})

test("improved tolerance handling", () => {
  const point1: ElbowPoint = { x: 0, y: 0, facingDirection: "x+" }
  const point2: ElbowPoint = { x: 0.0000001, y: 0.0000001, facingDirection: "y+" }
  
  // Should handle very small distances gracefully
  const result = calculateElbow(point1, point2, { overshoot: 0.1 })
  
  expect(result.length).toBeGreaterThan(1)
  expect(result[0]).toEqual({ x: 0, y: 0 })
  expect(result[result.length - 1]).toEqual({ x: 0.0000001, y: 0.0000001 })
})
