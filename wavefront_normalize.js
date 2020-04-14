#!/usr/bin/env node

const [, scriptPath, ...args] = process.argv

if (args.length !== 2 || args.includes("--help")) {
  console.info(`Usage:
    .${scriptPath} <input file name (wavefront obj)> <output file name (wavefront obj)>`)
  return
}

const fs = require("fs")
const [inputFileName, outputFileName] = args

fs.readFile(inputFileName, "utf8", (error, data) => {
  if (error) {
    console.error(error.message)
  } else {
    const lines = data
      .replace(/\r/g, "")
      .split("\n")
      .filter((line) => line)

    const splitLines = lines.map((line) => {
      const [descriminator, x, y, z, w] = line.split(" ")
      return [
        descriminator,
        Number.parseFloat(x),
        Number.parseFloat(y),
        Number.parseFloat(z),
        Number.parseFloat(w),
      ]
    })

    const { maxX, maxY, maxZ } = splitLines.reduce(
      (state, [, x, y, z]) => {
        state.maxX = Math.max(Math.abs(state.maxX), Math.abs(x))
        state.maxY = Math.max(Math.abs(state.maxY), Math.abs(y))
        state.maxZ = Math.max(Math.abs(state.maxZ), Math.abs(z))
        return state
      },
      {
        maxX: Number.MIN_SAFE_INTEGER,
        maxY: Number.MIN_SAFE_INTEGER,
        maxZ: Number.MIN_SAFE_INTEGER,
      }
    )

    fs.writeFile(
      outputFileName,
      splitLines
        .map(([descriminator, x, y, z, w]) => {
          return [descriminator, x / maxX, y / maxY, z / maxZ, w].join(" ")
        })
        .join("\n"),
      (error) => {
        if (error) {
          console.error(error.message)
        }
      }
    )
  }
})
