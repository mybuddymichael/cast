import { parseArgs } from 'util'

interface ParsedArgs {
	color: string
	format?: string
}

function parseCliArgs(args: string[] = Bun.argv): ParsedArgs {
	const { values, positionals } = parseArgs({
		args,
		options: {
			'to-rgb': { type: 'boolean' },
			'to-hsl': { type: 'boolean' },
			'to-hsv': { type: 'boolean' },
			'to-hsb': { type: 'boolean' },
			'to-hwb': { type: 'boolean' },
			'to-oklab': { type: 'boolean' },
			'to-oklch': { type: 'boolean' },
			help: { type: 'boolean', short: 'h' },
		},
		strict: true,
		allowPositionals: true,
	})

	if (values.help) {
		console.log(`
Usage: color-convert <color> [--to-rgb | --to-hsl | --to-hsv | --to-hsb | --to-hwb | --to-oklab | --to-oklch]

Examples:
  color-convert "#ff0000" --to-hsl
  color-convert "oklch(1.000 0.000 0)" --to-rgb
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
		'to-rgb',
		'to-hsl',
		'to-hsv',
		'to-hsb',
		'to-hwb',
		'to-oklab',
		'to-oklch',
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

	const format = activeFormats[0]!.replace('to-', '')

	return { color, format }
}

function main(): void {
	const { color, format } = parseCliArgs()

	console.log(`Converting color: ${color}`)
	console.log(`Target format: ${format}`)

	// TODO: Implement actual color conversion using color.js
}

main()
