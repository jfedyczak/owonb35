"use strict"

const fs = require('fs')
const EventEmitter = require('events')

const _b35 = module.exports = (filename) => {
	let ee = new EventEmitter()

	const parseLine = (line) => {
		if (line.length != 12)
			return;
		let readout = {
			ts: +new Date()
		}
		readout.display = line
			.slice(0, 5)
			.toString()
			.replace(/\?/g, ' ')
			.replace(/:/g, 'L')
		let p = {0: 0, 1: 1, 2: 2, 4: 3}[+line.slice(6,7).toString()]
		if (p > 0)
			readout.display = readout.display.slice(0, p + 1) + '.' + readout.display.slice(p + 1)
		if (line[5] != 32)
			console.log('nie ma spacji!!!')
		readout.auto = !!(line[7] & 0x20)
		readout.hold = !!(line[7] & 0x02)
		if (!!(line[10] & 0x80))
			readout.unit = 'V'
		else if (!!(line[10] & 0x20))
			readout.unit = 'Ohm'
		else if (!!(line[10] & 0x08))
			readout.unit = 'Hz'
		else if (!!(line[10] & 0x10))
			readout.unit = 'hFE'
		else if (!!(line[10] & 0x02))
			readout.unit = 'C'
		else if (!!(line[10] & 0x40))
			readout.unit = 'A'
		else
			readout.unit = '%'

		if (!!(line[9] & 0x80))
			readout.prefix = 'u'
		else if (!!(line[9] & 0x40))
			readout.prefix = 'm'
		else if (!!(line[9] & 0x20))
			readout.prefix = 'k'
		else if (!!(line[9] & 0x10))
			readout.prefix = 'M'
		else
			readout.prefix = ' '
		
		readout.min = !!(line[8] & 0x10)
		readout.max = !!(line[8] & 0x20)
		readout.delta = !!(line[7] & 0x04)
		readout.ac = !!(line[7] & 0x08)
		readout.dc = !!(line[7] & 0x10)
		
		readout.bar = (line[11] & 0x80 ? -1 : 1) * (line[11] & 0x7f)
		
		readout.absoluteValue = readout.value = parseFloat(readout.display)
		
		if (!isNaN(readout.absoluteValue))
			readout.absoluteValue *= {' ': 1.0, 'u': 1e-6, 'm': 1e-3, 'k': 1e3, 'M': 1e6}[readout.prefix]
		
		ee.emit('readout', readout)
			
		// console.log(
		// 	`${readout.value} ` +
		// 	`${readout.prefix}` +
		// 	`${readout.unit} ` +
		// 	`${readout.auto ? 'auto' : '    '} ` +
		// 	`${readout.hold ? 'hold' : '    '} ` +
		// 	`${readout.delta ? 'D' : ' '} ` +
		// 	`${readout.max ? 'max' : '   '} ` +
		// 	`${readout.min ? 'min' : '   '} ` +
		// 	`${readout.ac ? 'AC' : '  '} ` +
		// 	`${readout.dc ? 'DC' : '  '} ` +
		// 	`(${line.slice(7,8).toString('hex')}) ` +
		// 	`(${line.slice(8,9).toString('hex')}) ` +
		// 	`(${line.slice(9,10).toString('hex')}) ` +
		// 	`(${line.slice(10,11).toString('hex')}) ` +
		// 	`${line.slice(11).toString('hex')} ` +
		// 	`${readout.bar}`
		// )
	}

	let buffer = new Buffer(0)

	fs.createReadStream(filename)
		.on('data', (data) => {
			buffer = Buffer.concat([buffer, data])
			while (1) {
				let i = buffer.indexOf('0d0a', 'hex')
				if (i == -1) break;
				let line = buffer.slice(0, i)
				buffer = buffer.slice(i + 2)
				parseLine(line)
			}
		})
	
	return ee
}


if (!module.parent) {
	_b35(process.argv[2])
		.on('readout', (readout) => {
			console.log(JSON.stringify(readout))
		})
}