#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const packageJsonVersion = require(path.join(__dirname, '..', 'package.json')).version
const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts')
const versionFile = fs.readFileSync(versionFilePath, 'utf-8')
const updatedVersionFile = versionFile.replace(/\d+\.\d+\.\d+/, packageJsonVersion)
fs.writeFileSync(versionFilePath, updatedVersionFile, 'utf-8')
