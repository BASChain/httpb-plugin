/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2020 BAS,bas-devteam@gmail.com
 * E-mail :front-devgmail.com
 * git@flash:BASChain/httpb-plugin.git
 *
 */
const Info = require('./info.json')
const BrowerInfo = require('./check-runtime.js')
const { createRuntimeInfo, hasChromeSocketsForTCP } = require('./check-utils.js')
module.exports = {
  Info,
  BrowerInfo,
  createRuntimeInfo,
  hasChromeSocketsForTCP
}