#!/usr/bin/env node

const [, scriptPath, ...args] = process.argv

if (args.length !== 3 || args.includes("--help")) {
  console.info(`Usage:
    .${scriptPath} <scaling factor> <input file name (wavefront obj)> <output file name (wavefront obj)>`)
  return
}

const fs = require("fs")
const [scalingFactorString, inputFileName, outputFileName] = args

const scalingFactor = Number.parseFloat(scalingFactorString)

if (!Number.isFinite(scalingFactor)) {
  console.error(
    `Scaling factor must be a number, but instead was ${scalingFactorString}`
  )
}

fs.readFile(inputFileName, "utf8", (error, data) => {
  if (error) {
    console.error(error.message)
  } else {
    const lines = data
      .replace(/\r/g, "")
      .split("\n")
      .filter((line) => line)

    fs.writeFile(
      outputFileName,
      lines
        .map((line) => {
          const [descriminator, x, y, z, w] = line.split(" ")
          return [
            descriminator,
            Number.parseFloat(x) * scalingFactor,
            Number.parseFloat(y) * scalingFactor,
            Number.parseFloat(z) * scalingFactor,
            Number.parseFloat(w),
          ].join(" ")
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
