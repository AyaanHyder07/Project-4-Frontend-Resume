export const SECTION_KEY_ALIASES = {
  service_offerings: 'services',
  serviceofferings: 'services',
  services: 'services',
  blog_posts: 'blogPosts',
  blogposts: 'blogPosts',
  exhibitions_awards: 'exhibitions',
  exhibitions: 'exhibitions',
  awards_exhibitions: 'exhibitions',
  media_appearances: 'mediaAppearances',
  mediaappearances: 'mediaAppearances',
  financial_credentials: 'financialCredentials',
  financialcredentials: 'financialCredentials',
  contact: 'contact',
};

export const DEFAULT_SECTION_LABELS = {
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  publications: 'Publications',
  testimonials: 'Testimonials',
  services: 'Services',
  blogPosts: 'Blog Posts',
  exhibitions: 'Exhibitions & Awards',
  mediaAppearances: 'Media Appearances',
  financialCredentials: 'Financial Credentials',
  contact: 'Contact',
};

export function normalizeSectionKey(key) {
  const raw = String(key || '');
  const compact = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return SECTION_KEY_ALIASES[raw.toLowerCase()] || SECTION_KEY_ALIASES[compact] || raw;
}

export function getTemplateOptions(portfolio) {
  return portfolio?.templateOptions || portfolio?.customization?.templateOptions || {};
}

export function getTemplateLabels(portfolio) {
  return portfolio?.templateLabels || portfolio?.customization?.templateLabels || {};
}

export function getTemplateOption(portfolio, key, fallback = null) {
  const options = getTemplateOptions(portfolio);
  return options?.[key] ?? fallback;
}

export function getTemplateLabel(portfolio, key, fallback = '') {
  const labels = getTemplateLabels(portfolio);
  return labels?.[key] || fallback;
}

export function getSectionTitle(portfolio, key) {
  const normalized = normalizeSectionKey(key);
  const titles = portfolio?.sectionTitles || {};
  return titles?.[normalized] || DEFAULT_SECTION_LABELS[normalized] || normalized;
}

export function sectionHasContent(key, value) {
  if (normalizeSectionKey(key) === 'contact') {
    return Boolean(value && (value.email || value.phone || value.whatsapp || value.showContactForm));
  }
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function getOrderedSectionEntries(portfolio) {
  const sections = portfolio?.sections || {};
  const rawOrder = Array.isArray(portfolio?.sectionOrder) ? portfolio.sectionOrder : [];
  const seen = new Set();
  const keys = [];

  rawOrder.forEach((item) => {
    const normalized = normalizeSectionKey(item);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      keys.push(normalized);
    }
  });

  Object.keys(sections).forEach((item) => {
    const normalized = normalizeSectionKey(item);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      keys.push(normalized);
    }
  });

  return keys.map((key) => [key, sections[key]]).filter(([key, value]) => sectionHasContent(key, value));
}

export function getNavSections(portfolio, allowed = null) {
  const entries = getOrderedSectionEntries(portfolio);
  return entries
    .filter(([key]) => !allowed || allowed.includes(key))
    .map(([key]) => ({ key, title: getSectionTitle(portfolio, key) }));
}

export function getContactDetails(profile = {}, contact = {}) {
  const items = [
    profile?.email || contact?.email,
    profile?.phone || contact?.phone,
    contact?.whatsapp && contact?.whatsapp !== profile?.phone ? contact.whatsapp : null,
    profile?.location,
    profile?.linkedinUrl,
    profile?.githubUrl,
    profile?.websiteUrl,
    profile?.twitterUrl,
  ].filter(Boolean);

  return Array.from(new Set(items.map((item) => String(item).trim()).filter(Boolean)));
}

export function getPrimaryService(sections = {}) {
  return Array.isArray(sections?.services) && sections.services.length ? sections.services[0] : null;
}

export function getPrimaryProject(sections = {}) {
  return Array.isArray(sections?.projects) && sections.projects.length ? sections.projects[0] : null;
}

export function getDensityStyles(portfolio) {
  const density = getTemplateOption(portfolio, 'densityMode', 'balanced');
  if (density === 'compact') return { sectionGap: 18, cardPadding: 16, heroGap: 16 };
  if (density === 'spacious') return { sectionGap: 34, cardPadding: 28, heroGap: 28 };
  return { sectionGap: 24, cardPadding: 22, heroGap: 22 };
}

export function getContentWidth(portfolio, fallback = 1180) {
  const width = getTemplateOption(portfolio, 'contentWidth', 'normal');
  if (width === 'wide') return 1320;
  if (width === 'narrow') return 1024;
  return fallback;
}
