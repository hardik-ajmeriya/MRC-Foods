import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Image as ImageIcon,
  Save,
  Tag,
  UploadCloud,
  X
} from 'lucide-react';
import { resolveFoodImage } from '../utils/resolveImage';

const defaultState = {
  name: '',
  description: '',
  isActive: true,
  sortOrder: ''
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

const isValidImageFile = (file) => {
  if (!file) {
    return false;
  }

  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return true;
  }

  return /\.(jpe?g|png)$/i.test(file.name || '');
};

const CategoryFormModal = ({
  open,
  mode = 'create',
  initialValue,
  onSubmit,
  onClose,
  isSubmitting
}) => {
  const [formState, setFormState] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState({
      ...defaultState,
      ...initialValue,
      sortOrder: initialValue?.sortOrder ? String(initialValue.sortOrder) : ''
    });
    setErrors({});
    setImageFile(null);

    if (initialValue?.image) {
      setImagePreview(
        resolveFoodImage({
          image: initialValue.image,
          categoryName: initialValue.name,
          categoryId: initialValue.id
        })
      );
    } else {
      setImagePreview('');
    }
  }, [open, initialValue]);

  useEffect(() => {
    if (!imageFile) {
      return undefined;
    }

    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  if (!open) {
    return null;
  }

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!isValidImageFile(file)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPG or PNG images are allowed.' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be 5MB or less.' }));
      event.target.value = '';
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formState.name.trim()) {
      nextErrors.name = 'Category name is required.';
    }

    if (mode === 'create' && !imageFile) {
      nextErrors.image = 'Upload a JPG or PNG image.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = new FormData();
    payload.append('name', formState.name.trim());
    payload.append('description', formState.description.trim());
    payload.append('isActive', formState.isActive ? 'true' : 'false');

    if (formState.sortOrder !== '') {
      payload.append('sortOrder', formState.sortOrder);
    }

    if (imageFile) {
      payload.append('image', imageFile);
    }

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Tag className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {mode === 'create' ? 'Add category' : 'Edit category'}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {mode === 'create' ? 'Create new category' : 'Update category'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <form className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="category-name">
                Category name
              </label>
              <input
                id="category-name"
                type="text"
                value={formState.name}
                onChange={handleChange('name')}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="category-description">
                Description
              </label>
              <textarea
                id="category-description"
                rows={4}
                value={formState.description}
                onChange={handleChange('description')}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="category-sort">
                  Sort order
                </label>
                <input
                  id="category-sort"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.sortOrder}
                  onChange={handleChange('sortOrder')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-700">Status</p>
                  <p className="text-xs text-slate-500">Show category in menu.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={handleChange('isActive')}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500"
                  />
                  {formState.isActive ? 'Active' : 'Inactive'}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Category image</p>
                  <p className="text-xs text-slate-500">JPG or PNG up to 5MB.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                  <UploadCloud className="h-4 w-4" strokeWidth={2.2} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl bg-white">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="h-8 w-8" strokeWidth={1.8} />
                    <span className="text-xs">Upload a category image</span>
                  </div>
                )}
              </div>

              {errors.image ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
                  {errors.image}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-200/50 transition-colors duration-200 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" strokeWidth={2.2} />
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Add category'
                  : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
