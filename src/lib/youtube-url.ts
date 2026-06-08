const youtubeVideoIdPattern = /^[a-zA-Z0-9_-]{6,}$/;

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getYouTubeVideoId(value: string) {
  const normalizedUrl = normalizeHttpUrl(value);
  if (!normalizedUrl) return null;

  try {
    const url = new URL(normalizedUrl);
    const hostname = url.hostname.replace(/^www\./i, "").replace(/^m\./i, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(kind)) {
          videoId = id ?? null;
        }
      }
    }

    return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function isYouTubeVideoUrl(value: string) {
  return getYouTubeVideoId(value) !== null;
}

export function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
