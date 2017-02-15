"use strict"

const _b35 = require("./b35.js")
const blessed = require('blessed')

const colorActive = '#C581DB'
const colorInactive = '#202020'
const colorLog = '#97DB81'

const boolClr = (b) => b ? colorActive : colorInactive

let currentReadout = {}

let screen = blessed.screen({
	smartCSR: true,
	terminal: 'xterm-256color'
})

let display = blessed.box({
	parent: screen,
	top: '0%',
	left: '0%',
	width: '100%',
	height: 19,
	content: ' connecting...',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: colorActive,
		bg: 'black',
		border: {
			fg: 'grey'
		}
	}
})

let displayLog = blessed.box({
	parent: screen,
	top: 19,
	left: '0%',
	width: '100%',
	height: '100%-19',
	content: ' connecting...',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'green',
		bg: 'black',
		border: {
			fg: 'grey'
		}
	}
})

let displayLogContent = blessed.Log({
	parent: displayLog,
	top: 0,
	left: 0,
	// width: '100%',
	// height: '100%',
	content: ' connecting...',
	tags: true,
	scrollBack: 2000,
	scrollOnInput: true,
	style: {
		fg: colorLog,
		bg: 'black',
	}
})

// screen.append(display)

let displayReadout = blessed.BigText({
	parent: display,
	top: 0,
	left: 0,
	content: ' --.--',
	style: {
		fg: colorActive
	}
})

let displayPrefix = blessed.Text({
	parent: display,
	top: 11,
	left: 51,
	content: '-',
	style: {
		fg: colorActive
	}
})

let displayUnit = blessed.Text({
	parent: display,
	top: 11,
	left: 53,
	content: '-',
	style: {
		fg: colorActive
	}
})

let displayBar = blessed.ProgressBar({
	parent: display,
	left: 1,
	width: 63,
	top: 14,
	height: 1,
	filled: 50,
	style: {
		bg: colorInactive,
		bar: {
			fg: colorActive,
			bg: colorActive
		},
		border: {
			fg: colorActive,
			bg: colorInactive
		}
	},
	orientation: 'horizontal'
})

let displayBarValue = blessed.Text({parent: display, top: 14, left: 65, content: '--', style: { fg: colorActive }})

let displayCurrentAC = blessed.Text({parent: display, top: 4, left: 51, content: 'AC', style: { fg: colorInactive }})

let displayCurrentDC = blessed.Text({parent: display, top: 5, left: 51, content: 'DC', style: { fg: colorInactive }})

let displayAUTO = blessed.Text({parent: display, top: 2, left: 51, content: 'AUTO', style: { fg: colorInactive }})

let displayHOLD = blessed.Text({parent: display, top: 3, left: 51, content: 'HOLD', style: { fg: colorInactive }})

let displayMIN = blessed.Text({parent: display, top: 6, left: 51, content: 'MIN', style: { fg: colorInactive }})

let displayMAX = blessed.Text({parent: display, top: 7, left: 51, content: 'MAX', style: { fg: colorInactive }})

let displayDELTA = blessed.Text({parent: display, top: 8, left: 51, content: 'DELTA', style: { fg: colorInactive }})

screen.render()

_b35(process.argv[2])
	.on('readout', (readout) => {
		currentReadout = readout
		displayReadout.setContent(currentReadout.display)
		displayPrefix.setContent(currentReadout.prefix)
		displayUnit.setContent(currentReadout.unit)
		
		displayCurrentDC.style.fg = boolClr(readout.dc)
		displayCurrentAC.style.fg = boolClr(readout.ac)
		displayAUTO.style.fg = boolClr(readout.auto)
		displayHOLD.style.fg = boolClr(readout.hold)
		displayMIN.style.fg = boolClr(readout.min)
		displayMAX.style.fg = boolClr(readout.max)
		displayDELTA.style.fg = boolClr(readout.delta)
		displayBar.setProgress(100 * Math.abs(readout.bar) / 63)
		displayBarValue.setContent(`${readout.bar}`)
		
		displayLogContent.log(`${isNaN(readout.value) ? '---' : readout.value} ${readout.prefix}${readout.unit}`)
		
		screen.render()
	})
