import { MarkdownSection, SectionColors, SectionType } from '../shared/types';

export const parseMarkdownSections = (content: string): MarkdownSection[] => {
  const sections: MarkdownSection[] = [];
  const lines = content.split('\n');
  let currentSection = {
    title: '',
    content: '',
    type: 'default' as SectionType,
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith('**') &&
      trimmedLine.endsWith('**') &&
      trimmedLine.length > 4
    ) {
      if (currentSection.title || currentSection.content) {
        sections.push({ ...currentSection });
      }

      const title = trimmedLine.slice(2, -2);
      const type = determineSectionType(title);

      currentSection = { title, content: '', type };
    } else if (trimmedLine) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection.title || currentSection.content) {
    sections.push(currentSection);
  }

  return sections;
};

const determineSectionType = (title: string): SectionType => {
  if (title.includes('Persona') || title.includes('페르소나')) return 'persona';
  if (title.includes('금지') || title.includes('피해야')) return 'warning';
  if (title.includes('핵심') || title.includes('역할')) return 'primary';
  if (title.includes('주의') || title.includes('가이드')) return 'guide';
  if (title.includes('감성지능') || title.includes('활용'))
    return 'intelligence';
  return 'default';
};

export const getSectionColors = (type: SectionType): SectionColors => {
  const colorMap: Record<SectionType, SectionColors> = {
    persona: {
      bgColor: 'bg-blue-50 border-blue-200',
      titleColor: 'text-blue-800',
      contentColor: 'text-blue-700',
    },
    warning: {
      bgColor: 'bg-red-50 border-red-200',
      titleColor: 'text-red-800',
      contentColor: 'text-red-700',
    },
    primary: {
      bgColor: 'bg-green-50 border-green-200',
      titleColor: 'text-green-800',
      contentColor: 'text-green-700',
    },
    guide: {
      bgColor: 'bg-purple-50 border-purple-200',
      titleColor: 'text-purple-800',
      contentColor: 'text-purple-700',
    },
    intelligence: {
      bgColor: 'bg-orange-50 border-orange-200',
      titleColor: 'text-orange-800',
      contentColor: 'text-orange-700',
    },
    default: {
      bgColor: 'bg-gray-50 border-gray-200',
      titleColor: 'text-gray-800',
      contentColor: 'text-gray-700',
    },
  };

  return colorMap[type];
};
