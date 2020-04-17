#!/usr/bin/env node

const [, scriptPath, ...args] = process.argv

if (args.length !== 2 || args.includes("--help")) {
  console.info(`Usage:
    .${scriptPath} <input file name (wavefront obj)> <output file name (wavefront obj)>`)
  return
}

const fs = require("fs")
const [inputFileName, outputFileName] = args

const getDistance = ({ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 }) =>
  Math.sqrt(
    Math.abs(x2 - x1) ** 2 + Math.abs(y2 - y1) ** 2 + Math.abs(z2 - z1) ** 2
  )

const getCircumCenter = ([a, b, c]) => {
  /* Use coordinates relative to point `a' of the triangle. */
  const baX = b.x - a.x
  const baY = b.y - a.y
  const baZ = b.z - a.z
  const caX = c.x - a.x
  const caY = c.y - a.y
  const caZ = c.z - a.z

  /* Squares of lengths of the edges incident to `a'. */
  const baLength = baX * baX + baY * baY + baZ * baZ
  const caLength = caX * caX + caY * caY + caZ * caZ

  /* Cross product of these edges. */
  const xCrossBC = baY * caZ - caY * baZ
  const yCrossBC = baZ * caX - caZ * baX
  const zCrossBC = baX * caY - caX * baY

  /* Calculate the denominator of the formulae. */
  const denominator =
    0.5 / (xCrossBC * xCrossBC + yCrossBC * yCrossBC + zCrossBC * zCrossBC)

  /* Calculate offset (from `a') of circumcenter. */
  return {
    x:
      ((baLength * caY - caLength * baY) * zCrossBC -
        (baLength * caZ - caLength * baZ) * yCrossBC) *
      denominator,
    y:
      ((baLength * caZ - caLength * baZ) * xCrossBC -
        (baLength * caX - caLength * baX) * zCrossBC) *
      denominator,
    z:
      ((baLength * caX - caLength * baX) * yCrossBC -
        (baLength * caY - caLength * baY) * xCrossBC) *
      denominator,
  }
}
fs.readFile(inputFileName, "utf8", (error, data) => {
  if (error) {
    console.error(error.message)
  } else {
    const lines = data
      .replace(/\r/g, "")
      .split("\n")
      .filter((line) => line)

    const vertices = lines.map((line) => {
      const [, x, y, z] = line.split(" ")
      return {
        x: Number.parseFloat(x),
        y: Number.parseFloat(y),
        z: Number.parseFloat(z),
      }
    })

    const siblingVerticeIndicesForFaces = vertices.map(
      (currentVertex, currentIndex) => {
        const [, { index: vertexAIndex }, { index: vertexBIndex }] = vertices
          .map((compareVertex, compareIndex) => ({
            index: compareIndex,
            distance:
              currentIndex === compareIndex
                ? -1
                : getDistance(currentVertex, compareVertex),
          }))
          .sort(
            ({ distance: distanceA }, { distance: distanceB }) =>
              distanceA - distanceB
          )
        return [currentIndex, vertexAIndex, vertexBIndex]
      }
    )

    fs.writeFile(
      outputFileName,
      vertices
        .map(({ x, y, z }) => ["v", x, y, z, "1.0"].join(" "))
        .concat(
          siblingVerticeIndicesForFaces.map(([v1, v2, v3]) =>
            ["f", v1 + 1, v2 + 1, v3 + 1].join(" ")
          )
        )
        .join("\n"),
      (error) => {
        if (error) {
          console.error(error.message)
        }
      }
    )
  }
})
