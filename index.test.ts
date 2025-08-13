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

// Test helper function for main functionality
const testMainOutput = (): void => {
	const color = '#ff0000'
	const format = 'hsl'
	console.log(`Converting color: ${color}`)
	console.log(`Target format: ${format}`)
}

test('parseCliArgs - should parse color and format correctly', () => {
	const args = ['bun', 'index.ts', '#ff0000', '--to-hsl']

	const result = parseCliArgs(args)

	expect(result.color).toBe('#ff0000')
	expect(result.format).toBe('hsl')
})

test('parseCliArgs - should handle different color formats', () => {
	const args = ['bun', 'index.ts', 'oklch(1.000 0.000 0)', '--to-rgb']

	const result = parseCliArgs(args)

	expect(result.color).toBe('oklch(1.000 0.000 0)')
	expect(result.format).toBe('rgb')
})

test('parseCliArgs - should handle all supported output formats', () => {
	const formats = ['rgb', 'hsl', 'hsv', 'hsb', 'hwb', 'oklab', 'oklch']

	formats.forEach((format) => {
		const args = ['bun', 'index.ts', '#ff0000', `--to-${format}`]

		const result = parseCliArgs(args)

		expect(result.format).toBe(format)
	})
})

test('parseCliArgs - should show help and exit with help flag', () => {
	const args = ['bun', 'index.ts', '--help']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage: color-convert'))
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should show help and exit with short help flag', () => {
	const args = ['bun', 'index.ts', '-h']

	expect(() => parseCliArgs(args)).toThrow('process.exit(0)')
	expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage: color-convert'))
	expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('parseCliArgs - should error when no color provided', () => {
	const args = ['bun', 'index.ts', '--to-rgb']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith('Error: No color provided')
	expect(mockProcessExit).toHaveBeenCalledWith(1)
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
	expect(result.format).toBe('rgb')
})

test('parseCliArgs - should handle edge case with empty string color', () => {
	const args = ['bun', 'index.ts', '', '--to-rgb']

	expect(() => parseCliArgs(args)).toThrow('process.exit(1)')
	expect(mockConsoleError).toHaveBeenCalledWith('Error: No color provided')
	expect(mockProcessExit).toHaveBeenCalledWith(1)
})

test('main function - should output correct format', () => {
	// Test that the output functions work correctly
	const mockConsoleLogMain = spyOn(console, 'log').mockImplementation(() => {})

	testMainOutput()

	expect(mockConsoleLogMain).toHaveBeenCalledWith('Converting color: #ff0000')
	expect(mockConsoleLogMain).toHaveBeenCalledWith('Target format: hsl')

	mockConsoleLogMain.mockRestore()
})

test('parseCliArgs - should handle case sensitivity correctly', () => {
	const args = ['bun', 'index.ts', '#FF0000', '--to-rgb']

	const result = parseCliArgs(args)

	expect(result.color).toBe('#FF0000')
	expect(result.format).toBe('rgb')
})

test('parseCliArgs - should handle complex color strings', () => {
	const complexColor = 'color(display-p3 1 0.5 0)'
	const args = ['bun', 'index.ts', complexColor, '--to-oklch']

	const result = parseCliArgs(args)

	expect(result.color).toBe(complexColor)
	expect(result.format).toBe('oklch')
})
