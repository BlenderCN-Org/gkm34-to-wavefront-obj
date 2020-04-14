#!/usr/bin/env node

const [, scriptPath, ...args] = process.argv

if (args.length !== 2 || args.includes("--help")) {
  console.info(`Usage:
    .${scriptPath} <input file name (gkm34)> <output file name (wavefront obj)>

These ENV vars are also consumed:
    DECIMAL_SEPARATOR=[, | .]
    DATASET=[surface | terrain]
`)
  return
}

const fs = require("fs")
const [inputFileName, outputFileName] = args

const toFloat = (stringNumberFromFile) => {
  const parseAbleFloatingPointSeparator = stringNumberFromFile.replace(
    process.env.DECIMAL_SEPARATOR || ",",
    "."
  )
  return Number.parseFloat(parseAbleFloatingPointSeparator)
}

fs.readFile(inputFileName, "utf8", (error, data) => {
  if (error) {
    console.error(error.message)
  } else {
    const lines = data.replace(/\r/g, "").split("\n")
    fs.writeFile(
      outputFileName,
      lines
        .filter((line) => line)
        .map((line) => {
          const [pointCount, x, y, surface, terrain] = line.split("\t")
          return `v ${toFloat(y)} ${
            process.env.DATASET === "surface"
              ? toFloat(surface)
              : toFloat(terrain)
          } ${toFloat(x)} 1.0`
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
