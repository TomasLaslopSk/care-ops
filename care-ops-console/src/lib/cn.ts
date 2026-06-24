// Tiny class-name helper: joins truthy strings, ignores false/undefined.
// Lets components do: cn("base", condition && "extra", props.className)
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
