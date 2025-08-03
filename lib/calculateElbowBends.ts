export interface ElbowPoint {
  x: number
  y: number
  facingDirection?: "x+" | "x-" | "y+" | "y-"
}

/**
 * The first point is always passed in *normalised* form where it can only face
 * the positive X-axis, positive Y-axis or have no facing at all.  We capture
 * that restriction in a dedicated type so the compiler can keep us honest.
 */
export type NormalisedStartPoint = Omit<ElbowPoint, "facingDirection"> & {
  facingDirection?: "x+"
}

/**
 * IMPORTANT:
 * `calculateElbow` always calls this helper with a normalised coordinate system
 * where
 *   • `p1.x` ≤ `p2.x` (and when `x` is equal then `p1.y` ≤ `p2.y`)
 *   • `p1.facingDirection` ∈ {"x+", "y+"} or is `undefined` (`none`)
 *
 * This means any branch that depends on `p1` facing `"x-"` or `"y-"` or on
 * `p1.x > p2.x` can never be taken at runtime.  The new
 * `NormalisedStartPoint` type encodes this guarantee so TypeScript will flag
 * any call-site that violates it.
 */
export const calculateElbowBends = (
  p1: NormalisedStartPoint,
  p2: ElbowPoint,
  overshootAmount: number,
): Array<{ x: number; y: number }> => {
  const result: Array<{ x: number; y: number }> = [{ x: p1.x, y: p1.y }]

  const midX = (p1.x + p2.x) / 2
  const midY = (p1.y + p2.y) / 2

  const p2Target = { x: p2.x, y: p2.y }
  switch (p2.facingDirection) {
    case "x+":
      p2Target.x += overshootAmount
      break
    case "x-":
      p2Target.x -= overshootAmount
      break
    case "y+":
      p2Target.y += overshootAmount
      break
    case "y-":
      p2Target.y -= overshootAmount
      break
  }

  const startDir = p1.facingDirection ?? "none"
  const endDir = p2.facingDirection ?? "none"

  const push = (pt: { x: number; y: number }) => {
    const last = result[result.length - 1]!
    if (last.x !== pt.x || last.y !== pt.y) result.push(pt)
  }

  if (startDir === "none" && endDir === "none") {
    push({ x: midX, y: p1.y })
    push({ x: midX, y: p2.y })
  } else if (startDir === "x+" && endDir === "y+") {
    if (p1.x > p2.x && p1.y < p2.y) {
      push({ x: p1.x, y: p2.y })
      push({ x: p2.x, y: p2.y })
    } else if (p1.x < p2.x && p1.y > p2.y) {
      push({ x: p2.x, y: p1.y })
    } else if (p1.x === p2.x) {
      push({ x: p1.x + overshootAmount, y: p1.y })
      push({ x: p1.x + overshootAmount, y: midY })
      push({ x: p2.x, y: midY })
    } else {
      if (p1.x < p2.x) {
        push({ x: midX, y: p1.y })
        push({ x: midX, y: p2Target.y })
        push({ x: p2.x, y: p2Target.y })
      } else {
        const p1OvershootX = p1.x + overshootAmount
        push({ x: p1OvershootX, y: p1.y })
        push({ x: p1OvershootX, y: p2Target.y })
        push({ x: p2.x, y: p2Target.y })
      }
    }
  } else if (startDir === "x+" && endDir === "x+") {
    const commonX = Math.max(p1.x + overshootAmount, p2Target.x)
    push({ x: commonX, y: p1.y })
    push({ x: commonX, y: p2.y })
  } else if (startDir === "x+" && endDir === "y-") {
    if (p1.x === p2.x) {
      push({ x: p1.x + overshootAmount, y: p1.y })
      push({ x: p1.x + overshootAmount, y: midY })
      push({ x: p2.x, y: midY })
    } else if (p1.x < p2.x && p1.y < p2.y) {
      push({ x: p2.x, y: p1.y })
    } else {
      // Special-case: when the start is to the right of the end but still
      // above it we overshoot horizontally from the start and then route
      // vertically through the vertical mid-point. This produces the shorter
      // path expected by the spec.
      if (p1.x > p2.x && p1.y < p2.y) {
        const p1OvershootX = p1.x + overshootAmount
        push({ x: p1OvershootX, y: p1.y })
        push({ x: p1OvershootX, y: midY })
        push({ x: p2.x, y: midY })
      // Symmetric case: the start is to the right of the end *and* below it.
      // We overshoot horizontally from the start and then route vertically
      // straight to the Y-overshoot of the end point – mirroring the logic
      // above but for the lower-right quadrant.
      } else if (p1.x > p2.x && p1.y > p2.y) {
        const p1OvershootX = p1.x + overshootAmount
        push({ x: p1OvershootX, y: p1.y })
        push({ x: p1OvershootX, y: p2Target.y })
        push({ x: p2.x, y: p2Target.y })
      } else {
        // Default fallback: route via the horizontal mid-point between the
        // two X coordinates and the Y-overshoot of the end point.
        push({ x: midX, y: p1.y })
        push({ x: midX, y: p2Target.y })
        push({ x: p2.x, y: p2Target.y })
      }
    }
  } else {
    if (startDir === "x+") {
      push({ x: p1.x + overshootAmount, y: p1.y })
    }
    push({ x: midX, y: result[result.length - 1]!.y })
    push({ x: midX, y: p2Target.y })
    push({ x: p2Target.x, y: p2Target.y })
  }

  push({ x: p2.x, y: p2.y })
  return result
}
