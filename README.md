# color-convert

A tiny command line utility that converts colors.

## Usage examples

```bash
color-convert "#ff0000" --to-hsl # outputs "hsl(0, 100%, 50%)"
color-convert "oklch(1.000 0.000 0)" --to-rgb # outputs "rgb(255, 255, 255)"
```

## Installation

```bash
brew tap mybuddymichael/homebrew-tap
brew install mybuddymichael/tap/color-convert
```

## Usage

```
color-convert <color> [--to-rgb | --to-hsl | --to-hsv | --to-hsb | --to-hwb | --to-oklab | --to-oklch]
```

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Conversion backend

This utilizes [color.js](https://colorjs.io/) to convert colors.
