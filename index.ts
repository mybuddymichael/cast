import { parseArgs } from 'util'
import Color from 'colorjs.io'
import packageJson from './package.json' with { type: 'json' }

interface ParsedArgs {
	color: string
	format: string
	outputFormat: string
}

const HELP_TEXT = `Usage: cast <color> [--to-hex | --to-rgb | --to-hsl | --to-hsb | --to-oklch | --to-p3 | --to-lab | --to-lch | --to-xyz | --to-hwb]

Examples:
  cast "#ff0000" --to-hsl
  cast "oklch(1.000 0.000 0)" --to-rgb
  cast "rgba(255, 255, 255, 1)" --to-hex
  cast "hsl(120, 100%, 50%)" --to-p3
  cast "hsb(208 50% 100%)" --to-hsl
  cast "color(--hsv 208 50% 100%)" --to-hsl
  cast "lab(50% 20 -30)" --to-lch`

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
				version: { type: 'boolean', short: 'v' },
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
			console.error('Run `cast --help` for a list of supported formats.')
			process.exit(1)
		}
		throw error
	}

	if (values.help) {
		console.log(HELP_TEXT)
		process.exit(0)
	}

	if (values.version) {
		console.log(`cast v${packageJson.version}`)
		process.exit(0)
	}

	// Get the color from positionals (skip bun and script path)
	const color = positionals[2]
	if (!color || color.trim() === '') {
		console.log(HELP_TEXT)
		process.exit(0)
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

	// Strip 'to-' prefix to get the base format
	let format = targetFlag.slice(3)
	let outputFormat: string | undefined

	// Handle special cases where format needs adjustment
	switch (format) {
		case 'hex':
			format = 'srgb'
			outputFormat = 'hex'
			break
		case 'rgb':
			format = 'srgb'
			break
		case 'hsb':
			format = 'hsv'
			break
		case 'xyz':
			format = 'xyz-d65'
			break
	}

	// Default outputFormat to format for all other cases
	outputFormat = outputFormat || format

	return { color, format, outputFormat }
}

export function preprocessColorInput(colorInput: string): string {
	const trimmed = colorInput.trim()

	// Convert hsb(...) or hsba(...) to color(--hsv ...)
	const hsbMatch = trimmed.match(/^hsba?\(\s*(.+)\s*\)$/i)
	if (hsbMatch) {
		// Remove commas and normalize the inner content
		let innerContent = hsbMatch[1]!.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()

		// Check if this is hsba with alpha (4 values)
		const values = innerContent.split(/\s+/)
		if (values.length === 4) {
			// For alpha channel, use / separator
			const [h, s, l, a] = values
			innerContent = `${h} ${s} ${l} / ${a}`
		}

		return `color(--hsv ${innerContent})`
	}

	return colorInput
}

function main(): void {
	const { color, format, outputFormat } = parseCliArgs()

	const preprocessedColor = preprocessColorInput(color)
	const parsedColor = new Color(preprocessedColor)
	const outputColor = parsedColor.to(format)
	console.log(outputColor.toString({ format: outputFormat }))
}

// Required for testing
if (import.meta.main) {
	main()
}
