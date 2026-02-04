import { usePathname } from "next/navigation"

/**
 * Determines if a link URL is active based on the current pathname.
 * The link is active if it's the most specific parent path of the current pathname.
 * 
 * Examples:
 * - Current: /ansokningar/123/edit
 *   Links: / and /ansokningar/
 *   Result: /ansokningar/ is active (most specific parent)
 * 
 * - Current: /ansokningar
 *   Links: / and /ansokningar/
 *   Result: /ansokningar/ is active (exact match with trailing slash)
 * 
 * - Current: /
 *   Links: / and /ansokningar/
 *   Result: / is active (exact match)
 */
export function useIsActive(linkUrl: string): boolean {
  const pathname = usePathname()

  // Normalize URLs: remove trailing slashes for comparison, except for root "/"
  const normalizedPathname = pathname === "/" ? "/" : pathname.replace(/\/$/, "")
  const normalizedLinkUrl = linkUrl === "/" ? "/" : linkUrl.replace(/\/$/, "")

  // Check if the link is a parent or exact match of the current pathname
  if (normalizedPathname === normalizedLinkUrl) {
    return true
  }

  // Check if current path starts with the link URL (with slash boundary)
  if (normalizedPathname.startsWith(normalizedLinkUrl + "/")) {
    return true
  }

  return false
}

/**
 * Finds the most specific (longest) matching parent link from a list of links.
 * Use this when you want only one link to be active at a time (the most specific match).
 */
export function useMostSpecificActiveLink(
  links: { url: string }[]
): string | null {
  const pathname = usePathname()
  const normalizedPathname =
    pathname === "/" ? "/" : pathname.replace(/\/$/, "")

  let mostSpecificMatch: string | null = null
  let longestMatchLength = 0

  for (const link of links) {
    const normalizedLinkUrl =
      link.url === "/" ? "/" : link.url.replace(/\/$/, "")

    // Check for exact match or parent match
    const isMatch =
      normalizedPathname === normalizedLinkUrl ||
      normalizedPathname.startsWith(normalizedLinkUrl + "/")

    if (isMatch) {
      const matchLength = normalizedLinkUrl.length

      // Keep the longest (most specific) match
      if (matchLength > longestMatchLength) {
        mostSpecificMatch = link.url
        longestMatchLength = matchLength
      }
    }
  }

  return mostSpecificMatch
}
