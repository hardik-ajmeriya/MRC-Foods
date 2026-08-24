import { foodCategories } from '../constants/foodCategories';

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|\/|data:image\/)/i;
const RELATIVE_PATH_PATTERN = /^(uploads|food_dishes)\//i;
const BASE_URL = import.meta.env.BASE_URL || '/';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeBaseUrl = (value) => {
  if (!value) {
    return '/';
  }

  return value.endsWith('/') ? value : `${value}/`;
};

const baseUrl = normalizeBaseUrl(BASE_URL);

const resolveApiOrigin = () => {
  if (!API_BASE_URL) {
    return '';
  }

  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    return url.origin;
  } catch {
    return '';
  }
};

const apiOrigin = resolveApiOrigin();

const withBaseUrl = (path) => {
  if (!path.startsWith('/')) {
    return path;
  }

  return `${baseUrl}${path.slice(1)}`;
};

const withApiOrigin = (path) => {
  if (!apiOrigin) {
    return path;
  }

  return `${apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};

const normalizeCategoryKey = (value) => {
  if (!value) {
    return '';
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
};

const categoryImageMap = foodCategories.reduce((acc, category) => {
  const idKey = normalizeCategoryKey(category.id);
  const nameKey = normalizeCategoryKey(category.name);

  if (idKey) {
    acc[idKey] = category.image;
  }

  if (nameKey) {
    acc[nameKey] = category.image;
  }

  return acc;
}, {});

const normalizeImageValue = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (IMAGE_SOURCE_PATTERN.test(trimmed)) {
    if (trimmed.startsWith('/uploads/')) {
      return withApiOrigin(trimmed);
    }

    if (trimmed.startsWith('/')) {
      return withBaseUrl(trimmed);
    }

    return trimmed;
  }

  if (RELATIVE_PATH_PATTERN.test(trimmed)) {
    if (trimmed.toLowerCase().startsWith('uploads/')) {
      return withApiOrigin(`/${trimmed}`);
    }

    return withBaseUrl(`/${trimmed}`);
  }

  if (!trimmed.includes('/')) {
    return withApiOrigin(`/uploads/${encodeURIComponent(trimmed)}`);
  }

  return '';
};

export const resolveFoodImage = ({ image, categoryId, categoryName } = {}) => {
  const resolvedImage = normalizeImageValue(image);
  if (resolvedImage) {
    return resolvedImage;
  }

  const categoryKeys = [
    normalizeCategoryKey(categoryName),
    normalizeCategoryKey(categoryId)
  ];

  for (const key of categoryKeys) {
    if (key && categoryImageMap[key]) {
      return categoryImageMap[key];
    }
  }

  return '';
};
