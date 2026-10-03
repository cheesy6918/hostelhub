export interface ParsedVideo {
  type: 'gdrive' | 'youtube' | 'direct' | 'external' | 'none';
  embedUrl: string;
  originalUrl: string;
  isIframe: boolean;
}

export function parseVideoUrl(url?: string | null): ParsedVideo {
  if (!url || !url.trim()) {
    return { type: 'none', embedUrl: '', originalUrl: '', isIframe: false };
  }

  const raw = url.trim();

  // 1. Google Drive Video
  // Matches:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/preview
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=))([a-zA-Z0-9_-]+)/;
  const driveMatch = raw.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: raw,
      isIframe: true,
    };
  }

  // 2. YouTube Video
  // Matches:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = raw.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      originalUrl: raw,
      isIframe: true,
    };
  }

  // 3. Direct video format (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(raw)) {
    return {
      type: 'direct',
      embedUrl: raw,
      originalUrl: raw,
      isIframe: false,
    };
  }

  // 4. Fallback link
  return {
    type: 'external',
    embedUrl: raw,
    originalUrl: raw,
    isIframe: false,
  };
}
