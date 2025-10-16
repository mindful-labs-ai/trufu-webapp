const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;

export const parseSimpleMarkdown = (text: string): string => {
  if (!text) return '';

  let html = text;

  // 코드 블록 (```) - 먼저 처리하여 다른 마크다운 파싱으로부터 보호
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-2"><code>$1</code></pre>'
  );

  // 인라인 코드 (`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
  );

  // 굵은 글씨 (**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 기울임 글씨 (*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 링크 [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-strong underline">$1</a>'
  );

  // 헤딩 처리 (줄바꿈 전에 처리)
  html = html.replace(
    /^### (.*$)/gm,
    '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gm,
    '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gm,
    '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
  );

  // 줄바꿈 처리
  html = html.replace(/\n/g, '<br>');

  // 리스트 태그들 사이의 불필요한 <br> 제거
  html = cleanupListBreaks(html);

  // 리스트 처리
  html = processLists(html);

  // 첫 번째와 마지막에 p 태그 추가 (다른 블록 요소가 아닌 경우에만)
  if (html && !html.match(/^<(h[1-6]|ul|ol|pre|div)/)) {
    html = '<p>' + html + '</p>';
  }

  return html;
};

const processLists = (html: string): string => {
  const lines = html.split('\n');
  const result: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    const unorderedMatch = trimmedLine.match(/^[\-\*] (.*)$/);
    const orderedMatch = trimmedLine.match(/^\d+\. (.*)$/);

    if (unorderedMatch) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          result.push('</ol>');
          inOrderedList = false;
        }
        result.push('<ul class="list-disc list-inside ml-4 mt-2 mb-2">');
        inUnorderedList = true;
      }
      result.push(`<li>${unorderedMatch[1]}</li>`);
    } else if (orderedMatch) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          result.push('</ul>');
          inUnorderedList = false;
        }
        result.push('<ol class="list-decimal list-inside ml-4 mt-2 mb-2">');
        inOrderedList = true;
      }
      result.push(`<li>${orderedMatch[1]}</li>`);
    } else {
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      result.push(line);
    }
  }

  if (inUnorderedList) {
    result.push('</ul>');
  }
  if (inOrderedList) {
    result.push('</ol>');
  }

  return result.join('\n');
};

export const sanitizeHtml = (html: string): string => {
  const allowedTags = [
    'p',
    'span',
    'br',
    'strong',
    'em',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'ul',
    'ol',
    'li',
    'a',
  ];

  return html.replace(TAG_REGEX, (match, tagName) => {
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return '';
    }
    return match;
  });
};

/**
 * 리스트 태그들 사이의 불필요한 <br> 태그 제거
 */
const cleanupListBreaks = (html: string): string => {
  const list: [RegExp, string][] = [
    [/<br>\s*<(ul|ol)/g, '<$1'],
    [/<\/(ul|ol)>\s*<br>/g, '</$1>'],
    [/<\/li>\s*<br>\s*<li>/g, '</li><li>'],
    [/<(ul|ol)([^>]*)>\s*<br>/g, '<$1$2>'],
    [/<br>\s*<\/(ul|ol)>/g, '</$1>'],
  ];
  let cleaned = html;
  for (const [regex, replacement] of list) {
    cleaned = cleaned.replace(regex, replacement);
  }
  return cleaned;
};
