import { parseArgs } from 'util'
import Color from 'colorjs.io'

interface ParsedArgs {
	color: string
	format: string
	outputFormat: string
}

export function parseCliArgs(args: string[] = Bun.argv): ParsedArgs {
	let values: Record<string, unknown>, positionals: string[]

	try {
		const parsed = parseArgs({
			args,
			options: {
				'to-hex': { type: 'boolean' },
				'to-rgb': { type: 'boolean' },
				'to-hsl': { type: 'boolean' },
				'to-hsb': { type: 'boolean' },
				'to-oklch': { type: 'boolean' },
				'to-p3': { type: 'boolean' },
				'to-lab': { type: 'boolean' },
				'to-lch': { type: 'boolean' },
				'to-xyz': { type: 'boolean' },
				'to-hwb': { type: 'boolean' },
				help: { type: 'boolean', short: 'h' },
			},
			strict: true,
			allowPositionals: true,
		})
		values = parsed.values
		positionals = parsed.positionals
	} catch (error) {
		if (
			error instanceof Error &&
			'code' in error &&
			error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
		) {
			console.error("I can't output to that type.")
			console.error(
				'Supported formats: --to-hex, --to-rgb, --to-hsl, --to-hsb, --to-oklch, --to-p3, --to-lab, --to-lch, --to-xyz, --to-hwb',
			)
			process.exit(1)
		}
		throw error
	}

	if (values.help) {
		console.log(`
Usage: color-convert <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]

Examples:
  color-convert "#ff0000" --to-hsl
  color-convert "oklch(1.000 0.000 0)" --to-rgb
  color-convert "rgba(255, 255, 255, 1)" --to-hex
  color-convert "hsl(120, 100%, 50%)" --to-p3
  color-convert "lab(50% 20 -30)" --to-lch
    `)
		process.exit(0)
	}

	// Get the color from positionals (skip bun and script path)
	const color = positionals[2]
	if (!color) {
		console.error('Error: No color provided')
		process.exit(1)
	}

	// Determine the target format
	const formatFlags = [
		'to-hex',
		'to-rgb',
		'to-hsl',
		'to-hsb',
		'to-oklch',
		'to-p3',
		'to-lab',
		'to-lch',
		'to-xyz',
		'to-hwb',
	] as const
	const activeFormats = formatFlags.filter((flag) => values[flag as keyof typeof values])

	if (activeFormats.length === 0) {
		console.error('Error: No target format specified')
		process.exit(1)
	}

	if (activeFormats.length > 1) {
		console.error('Error: Multiple target formats specified, choose one')
		process.exit(1)
	}

	const targetFlag = activeFormats[0]!
	let format: string
	let outputFormat: string

	// Map CLI flags to Color.js space identifiers and output formats
	switch (targetFlag) {
		case 'to-hex':
			format = 'srgb'
			outputFormat = 'hex'
			break
		case 'to-rgb':
			format = 'srgb'
			outputFormat = 'srgb'
			break
		case 'to-hsl':
			format = 'hsl'
			outputFormat = 'hsl'
			break
		case 'to-hsb':
			format = 'hsv'
			outputFormat = 'hsv'
			break
		case 'to-oklch':
			format = 'oklch'
			outputFormat = 'oklch'
			break
		case 'to-p3':
			format = 'p3'
			outputFormat = 'p3'
			break
		case 'to-lab':
			format = 'lab'
			outputFormat = 'lab'
			break
		case 'to-lch':
			format = 'lch'
			outputFormat = 'lch'
			break
		case 'to-xyz':
			format = 'xyz-d65'
			outputFormat = 'xyz-d65'
			break
		case 'to-hwb':
			format = 'hwb'
			outputFormat = 'hwb'
			break
		default:
			console.error('Error: Unsupported format')
			process.exit(1)
	}

	return { color, format, outputFormat }
}

function main(): void {
	const { color, format, outputFormat } = parseCliArgs()

	const parsedColor = new Color(color)
	const outputColor = parsedColor.to(format)
	console.log(outputColor.toString({ format: outputFormat }))
}

// Required for testing
if (import.meta.main) {
	main()
}
