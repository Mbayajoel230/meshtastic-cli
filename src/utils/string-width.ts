import stringWidth from "string-width";

// Re-export for convenience
export { default as stringWidth } from "string-width";

// Truncate string to fit within maxWidth visual columns
export function truncateVisual(str: string, maxWidth: number): string {
  let width = 0;
  let result = "";
  for (const { segment: char } of new Intl.Segmenter().segment(str)) {
    const charWidth = stringWidth(char);
    if (width + charWidth > maxWidth) break;
    result += char;
    width += charWidth;
  }
  return result;
}

// Pad string to target visual width with spaces
export function padEndVisual(str: string, targetWidth: number): string {
  const currentWidth = stringWidth(str);
  if (currentWidth >= targetWidth) return str;
  return str + " ".repeat(targetWidth - currentWidth);
}

// Truncate and pad to exact visual width
export function fitVisual(str: string, width: number): string {
  return padEndVisual(truncateVisual(str, width), width);
}
