import type { MarkdownInstance } from 'astro';
export interface JournalFrontmatter {
  title: string;
  description: string;
  category: string;
  readTime: string;
  draft?: boolean;
}
const modules = import.meta.glob<MarkdownInstance<JournalFrontmatter>>('../content/journal/*.md', { eager: true });
export const articles = Object.entries(modules)
  .filter(([, article]) => !article.frontmatter.draft)
  .map(([path, article]) => ({ slug: path.split('/').pop()!.replace(/\.md$/, ''), ...article }));
