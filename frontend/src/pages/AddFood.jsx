import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Image,
  IndianRupee,
  Leaf,
  Tag,
  UploadCloud,
  UtensilsCrossed
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../features/auth/hooks/useAuth';
import { foodCategories } from '../constants/foodCategories';

const initialFormState = {
  name: '',
  price: '',
  category: '',
  type: 'veg'
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

const AddFood = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const canManageFoods = useMemo(
    () => user?.role === 'staff' || user?.role === 'admin',
    [user]
  );

  const updateField = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  useEffect(() => {
    if (!imagePreviewUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleImageChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreviewUrl('');
      setImageFileName('');
      setImageFile(null);
      return;
    }

    if (!isValidImageFile(file)) {
      setImagePreviewUrl('');
      setImageFileName('');
      setImageFile(null);
      setErrors((prev) => ({ ...prev, image: 'Only JPG or PNG images are allowed.' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImagePreviewUrl('');
      setImageFileName('');
      setImageFile(null);
      setErrors((prev) => ({ ...prev, image: 'Image size must be 5MB or less.' }));
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setImageFileName(file.name);
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: '' }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};

    if (!formState.name.trim()) {
      nextErrors.name = 'Food name is required.';
    }

    const priceValue = Number(formState.price);
    if (!formState.price || Number.isNaN(priceValue) || priceValue <= 0) {
      nextErrors.price = 'Enter a valid price.';
    }

    if (!formState.category.trim()) {
      nextErrors.category = 'Category is required.';
    }

    if (!formState.type) {
      nextErrors.type = 'Select veg or non-veg.';
    }

    if (!imageFile) {
      nextErrors.image = 'Upload a JPG or PNG image.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formState, imageFile]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setStatus(null);

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = new FormData();
        payload.append('name', formState.name.trim());
        payload.append('price', String(Number(formState.price)));
        payload.append('category', formState.category.trim());
        payload.append('type', formState.type);
        payload.append('image', imageFile);

        const response = await api.post('/foods', payload);

        setStatus({
          type: 'success',
          message: response?.message || 'Food item added successfully.'
        });
        setFormState(initialFormState);
        setErrors({});
        setImagePreviewUrl('');
        setImageFileName('');
        setImageFile(null);
      } catch (error) {
        setStatus({
          type: 'error',
          message: error?.message || 'Unable to add the food item.'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, imageFile, validate]
  );
  return (
    <div className="relative min-h-screen bg-surface text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_20%_10%,rgba(252,128,25,0.18),transparent_60%),radial-gradient(120%_120%_at_90%_10%,rgba(14,165,233,0.12),transparent_55%)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-200/50">
              <UtensilsCrossed className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Add Food Item
              </h1>
              <p className="text-sm text-slate-500">
                Create menu items that show up instantly on the home screen.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-brand-200 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Back to Home
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-card backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">Publishing checklist</h2>
            <p className="mt-2 text-sm text-slate-500">
              Keep the menu consistent and trustworthy for customers.
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  1
                </span>
                <p>Provide a short, clear name that matches the dish.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  2
                </span>
                <p>Use a category that customers already recognize.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  3
                </span>
                <p>Upload a fresh image to boost order confidence.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-slate-100">
              <p className="font-semibold">Access level</p>
              <p className="mt-1 text-slate-300">
                {canManageFoods
                  ? 'You have permission to manage menu items.'
                  : 'You need staff or admin access to add items.'}
              </p>
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card"
          >
            <div className="space-y-5">
              {status ? (
                <div
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${status.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5" strokeWidth={2.2} />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5" strokeWidth={2.2} />
                  )}
                  <span>{status.message}</span>
                </div>
              ) : null}

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="food-name">
                  Food name
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                  <UtensilsCrossed className="h-5 w-5 text-slate-400" strokeWidth={2} />
                  <input
                    id="food-name"
                    type="text"
                    value={formState.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Paneer tikka wrap"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                  />
                </div>
                {errors.name ? (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{errors.name}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="food-price">
                    Price
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                    <IndianRupee className="h-5 w-5 text-slate-400" strokeWidth={2} />
                    <input
                      id="food-price"
                      type="number"
                      min="0"
                      step="1"
                      value={formState.price}
                      onChange={(event) => updateField('price', event.target.value)}
                      placeholder="120"
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                  {errors.price ? (
                    <p className="mt-2 text-xs font-semibold text-rose-600">{errors.price}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="food-category">
                    Category
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                    <Tag className="h-5 w-5 text-slate-400" strokeWidth={2} />
                    <select
                      id="food-category"
                      value={formState.category}
                      onChange={(event) => updateField('category', event.target.value)}
                      className="w-full appearance-none bg-transparent text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {foodCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category ? (
                    <p className="mt-2 text-xs font-semibold text-rose-600">{errors.category}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Veg or Non-Veg</label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors duration-200 ${formState.type === 'veg'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="food-type"
                      value="veg"
                      checked={formState.type === 'veg'}
                      onChange={(event) => updateField('type', event.target.value)}
                      className="sr-only"
                    />
                    <Leaf className="h-5 w-5" strokeWidth={2} />
                    Veg
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors duration-200 ${formState.type === 'non-veg'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:border-rose-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="food-type"
                      value="non-veg"
                      checked={formState.type === 'non-veg'}
                      onChange={(event) => updateField('type', event.target.value)}
                      className="sr-only"
                    />
                    <Flame className="h-5 w-5" strokeWidth={2} />
                    Non-Veg
                  </label>
                </div>
                {errors.type ? (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{errors.type}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Image upload</label>
                <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 transition-colors duration-200 hover:border-brand-200">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <UploadCloud className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Upload a food image</p>
                    <p className="text-xs text-slate-500">
                      JPG or PNG up to 5MB. Students will see it instantly.
                    </p>
                  </div>
                </label>
                {errors.image ? (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{errors.image}</p>
                ) : null}
                {imagePreviewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="relative aspect-[4/3]">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Image className="h-4 w-4" strokeWidth={2} />
                        Image ready
                      </span>
                      <span className="font-semibold text-slate-700">
                        {imageFileName || 'Embedded'}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !canManageFoods}
                className="inline-flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-200/50 transition-all duration-200 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Adding item...' : 'Add Food Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
