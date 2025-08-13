# color-convert

A tiny command line utility that converts colors from one format to another.

## Usage examples

```bash
color-convert "#ff0000" --to-hsl                  # -> hsl(0, 100%, 50%)
color-convert "oklch(1.000 0.000 0)" --to-rgb     # -> rgb(255, 255, 255)
color-convert "rgba(0, 0, 255, 0.7)" --to-oklch   # -> oklch(45.201% 0.31321 264.05 / 0.7)
```

## Installation and usage

### Use without installing
```bash
bunx color-convert <color> [--to-rgb | --to-hsl | --to-hsv | --to-hsb | --to-hwb | --to-oklab | --to-oklch]
```
Or with `npx`:
```bash
npx color-convert <color> [--to-rgb | --to-hsl | --to-hsv | --to-hsb | --to-hwb | --to-oklab | --to-oklch]
```

### Install via npm
```bash
bun add -g color-convert
```
```bash
npm install -g color-convert
```

### Homebrew
```bash
brew tap mybuddymichael/homebrew-tap
brew install mybuddymichael/tap/color-convert
color-convert <color> [--to-rgb | --to-hsl | --to-hsv | --to-hsb | --to-hwb | --to-oklab | --to-oklch]
```

### Using from LLMs

Put something like this in your prompt file to help LLMs convert colors:

```markdown
Use the `color-convert` command to convert colors from one format to another.
Run `color-convert --help` for usage and a list of supported formats.
```

> [!NOTE]
> If you are using this tool with your LLM, I recommend you install it first (and not use it with `bunx` or `npx`) so that you have a known-safe and pristine copy on your device.

### Help and documentation

Run `color-convert --help` for a list of supported formats.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts <color> <output format>
```

## Conversion backend

This utilizes [color.js](https://colorjs.io/) to convert colors.
