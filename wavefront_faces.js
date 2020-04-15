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
