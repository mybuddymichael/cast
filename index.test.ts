import { test, expect, mock, spyOn, beforeEach, afterEach } from 'bun:test'
import { parseCliArgs } from './index.ts'

let mockProcessExit: any
let mockConsoleLog: any
let mockConsoleError: any
let originalProcess: any

beforeEach(() => {
	mockProcessExit = mock((code: number) => {
		throw new Error(`process.exit(${code})`)
	})
	mockConsoleLog = spyOn(console, 'log').mockImplementation(() => {})
	mockConsoleError = spyOn(console, 'error').mockImplementation(() => {})

	// Store original process and replace process.exit
	originalProcess = (global as any).process
	;(global as any).process = { exit: mockProcessExit }
})

afterEach(() => {
	mockConsoleLog.mockRestore()
	mockConsoleError.mockRestore()
	// Restore original process
	;(global as any).process = originalProcess
})

test('parseCliArgs - should parse color and format correctly', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--to-hsl']

	const result = parseCliArgs(args)

	expect(result.color).toBe('#ff0000')
	expect(result.format).toBe('hsl')
	expect(result.outputFormat).toBe('hsl')
})

test('parseCliArgs - should handle different color formats', () => {
	const args = ['bun', 'index.ts', 'oklch(1.000 0.000 0)', '--to-rgb']

	const result = parseCliArgs(args)

	expect(result.color).toBe('oklch(1.000 0.000 0)')
	expect(result.format).toBe('srgb')
	expect(result.outputFormat).toBe('srgb')
})

test('parseCliArgs - should handle all supported output formats', () => {
	const testCases = [
		{ flag: 'hex', expectedFormat: 'srgb', expectedOutput: 'hex' },
		{ flag: 'rgb', expectedFormat: 'srgb', expectedOutput: 'srgb' },
		{ flag: 'hsl', expectedFormat: 'hsl', expectedOutput: 'hsl' },
		{ flag: 'hsb', expectedFormat: 'hsv', expectedOutput: 'hsv' },
		{ flag: 'oklch', expectedFormat: 'oklch', expectedOutput: 'oklch' },
	]

	testCases.forEach(({ flag, expectedFormat, expectedOutput }) => {
		const args = ['bun', 'index.ts', '#ff0000', `--to-${flag}`]

		const result = parseCliArgs(args)

		expect(result.format).toBe(expectedFormat)
		expect(result.outputFormat).toBe(expectedOutput)
	})
})

test('parseCliArgs - should show help and exit with help flag', () => {
	const args = ['bun', 'index.ts', '--help']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(
		expect.stringContaining(
			'Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]',
		),
	)
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should show help and exit with short help flag', () => {
	const args = ['bun', 'index.ts', '-h']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(
		expect.stringContaining(
			'Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]',
		),
	)
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should show help when no color provided', () => {
	const args = ['bun', 'index.ts', '--to-rgb']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(
		expect.stringContaining(
			'Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]',
		),
	)
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should error when no target format specified', () => {
	const args = ['bun', 'index.ts', '#ff0000']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith('Error: No target format specified')
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('parseCliArgs - should error when multiple target formats specified', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--to-rgb', '--to-hsl']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith(
		'Error: Multiple target formats specified, choose one',
	)
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('parseCliArgs - should handle colors with spaces when quoted', () => {
	const args = ['bun', 'index.ts', 'hsl(120, 100%, 50%)', '--to-rgb']

	const result = parseCliArgs(args)

	expect(result.color).toBe('hsl(120, 100%, 50%)')
	expect(result.format).toBe('srgb')
	expect(result.outputFormat).toBe('srgb')
})

test('parseCliArgs - should show help with empty string color', () => {
	const args = ['bun', 'index.ts', '', '--to-rgb']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(
		expect.stringContaining(
			'Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]',
		),
	)
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('color conversion integration - should handle real color conversions', () => {
	// Test with a real Color.js conversion to ensure the integration works
	const Color = require('colorjs.io').default

	// Test hex to HSL conversion
	const redColor = new Color('#ff0000')
	const hslColor = redColor.to('hsl')
	const hslString = hslColor.toString({ format: 'hsl' })

	expect(hslString).toContain('hsl(')
	expect(hslString).toContain('0') // hue for red
	expect(hslString).toContain('100%') // saturation
	expect(hslString).toContain('50%') // lightness
})

test('hex format conversion - should convert to hex correctly', () => {
	const Color = require('colorjs.io').default

	// Test RGB to hex conversion
	const rgbColor = new Color('rgb(255, 0, 0)')
	const srgbColor = rgbColor.to('srgb')
	const hexString = srgbColor.toString({ format: 'hex' })

	// Color.js may return shortened hex format like #f00 instead of #ff0000
	expect(hexString).toMatch(/^#f{1,2}0{1,2}0{0,2}$/)
})

test('parseCliArgs - should handle hex format flag', () => {
	const args = ['bun', 'index.ts', 'rgb(255, 0, 0)', '--to-hex']

	const result = parseCliArgs(args)

	expect(result.color).toBe('rgb(255, 0, 0)')
	expect(result.format).toBe('srgb')
	expect(result.outputFormat).toBe('hex')
})

test('parseCliArgs - should handle case sensitivity correctly', () => {
	const args = ['bun', 'index.ts', '#FF0000', '--to-rgb']

	const result = parseCliArgs(args)

	expect(result.color).toBe('#FF0000')
	expect(result.format).toBe('srgb')
	expect(result.outputFormat).toBe('srgb')
})

test('parseCliArgs - should handle complex color strings', () => {
	const complexColor = 'color(display-p3 1 0.5 0)'
	const args = ['bun', 'index.ts', complexColor, '--to-oklch']

	const result = parseCliArgs(args)

	expect(result.color).toBe(complexColor)
	expect(result.format).toBe('oklch')
	expect(result.outputFormat).toBe('oklch')
})

test('parseCliArgs - should error with unsupported format flag', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--to-cmyk']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith("I can't output to that type.")
	expect(mockConsoleError).toHaveBeenCalledWith(
		'Run `cast --help` for a list of supported formats.',
	)
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('parseCliArgs - should error with unknown option flag', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--unknown-flag']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith("I can't output to that type.")
	expect(mockConsoleError).toHaveBeenCalledWith(
		'Run `cast --help` for a list of supported formats.',
	)
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('parseCliArgs - should handle multiple invalid flags gracefully', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--invalid1', '--invalid2']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith("I can't output to that type.")
	expect(mockConsoleError).toHaveBeenCalledWith(
		'Run `cast --help` for a list of supported formats.',
	)
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('parseCliArgs - should show help when no arguments provided', () => {
	const args = ['bun', 'index.ts']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(
		expect.stringContaining(
			'Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]',
		),
	)
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should show version and exit with version flag', () => {
	const args = ['bun', 'index.ts', '--version']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith('cast v0.1.0')
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should show version and exit with short version flag', () => {
	const args = ['bun', 'index.ts', '-v']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith('cast v0.1.0')
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})
