'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack as ArrowLeft,
  MdSave as Save,
  MdQrCode as Barcode,
  MdDocumentScanner as ScanBarcode,
  MdAddPhotoAlternate as AddPhoto,
  MdDelete as Trash,
} from 'react-icons/md';
import adminService from '@/services/adminService';

type ItemFormMode = 'create' | 'edit';

interface ItemFormProps {
  mode: ItemFormMode;
  itemId?: string;
}

interface CategoryOption {
  _id: string;
  name: string;
}

interface OccasionOption {
  name: string;
  value: string;
}

interface CollectionOption {
  _id?: string;
  id?: string;
  name: string;
}

interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

const tabs = ['Images', 'Pricing', 'Stock', 'Other', 'Party Wise Prices'];

export default function ItemForm({ mode, itemId }: ItemFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(mode === 'create' ? 'Images' : 'Pricing');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [occasions, setOccasions] = useState<OccasionOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    category: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '5',
    asOfDate: new Date().toISOString().slice(0, 10),
    weight: '',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    tags: '',
    isActive: true,
    isFeatured: false,
    lowStockAlert: true,
    partyWisePricingNotes: '',
  });

  const pageTitle = mode === 'create' ? 'Create New Item' : 'Edit Item';

  useEffect(() => {
    loadCategories();
    loadOccasions();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && itemId) {
      loadItem(itemId);
    }
  }, [mode, itemId]);

  useEffect(() => {
    loadCollections(selectedOccasions);
  }, [selectedOccasions]);

  useEffect(() => {
    if (scannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [scannerOpen]);

  const loadCategories = async () => {
    const res = await adminService.getAllCategories({ limit: 200, sortBy: 'name', sortOrder: 'asc' });
    if (res.success) {
      setCategories(res.data || []);
    }
  };

  const loadOccasions = async () => {
    const res = await adminService.getOccasions();
    if (res.success) {
      setOccasions(res.data || []);
    }
  };

  const loadCollections = async (occasionValues: string[]) => {
    const res = await adminService.getCollections(occasionValues);
    if (res.success) {
      setCollections(res.data || []);
    }
  };

  const loadItem = async (id: string) => {
    try {
      setLoading(true);
      const res = await adminService.getProductById(id);
      if (!res.success || !res.data) {
        alert(res.error || 'Failed to load item');
        router.push('/admin/items');
        return;
      }
      const product = res.data;
      const normalizedImages = (product.images || [])
        .filter((img: any) => img?.url)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setExistingImages(normalizedImages);

      setForm({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        category: product.category?._id || product.category || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: String(product.price ?? ''),
        comparePrice: String(product.comparePrice ?? ''),
        costPrice: String(product.costPrice ?? ''),
        stock: String(product.inventory?.quantity ?? 0),
        lowStockThreshold: String(product.inventory?.lowStockThreshold ?? 5),
        asOfDate: new Date().toISOString().slice(0, 10),
        weight: String(product.weight ?? ''),
        length: String(product.dimensions?.length ?? ''),
        width: String(product.dimensions?.width ?? ''),
        height: String(product.dimensions?.height ?? ''),
        dimensionUnit: product.dimensions?.unit || 'cm',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        isActive: product.isActive !== false,
        isFeatured: !!product.isFeatured,
        lowStockAlert: (product.inventory?.lowStockThreshold ?? 0) > 0,
        partyWisePricingNotes: '',
      });

      const itemOccasions = Array.isArray(product.occasions)
        ? product.occasions.filter(Boolean)
        : [];
      setSelectedOccasions(itemOccasions);

      const itemCollections = Array.isArray(product.collections)
        ? product.collections
            .map((col: any) => col?._id || col?.id || col)
            .filter(Boolean)
        : [];
      setSelectedCollections(itemCollections);
    } finally {
      setLoading(false);
    }
  };

  const stockUnitLabel = useMemo(() => 'PCS', []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => {
      const next: any = { ...prev, [name]: parsedValue };
      if (name === 'name' && (!prev.slug || prev.slug === slugify(prev.name))) {
        next.slug = slugify(value);
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length !== files.length) {
      alert('Some files were ignored. Only images are allowed.');
    }
    const mapped = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const makeExistingPrimary = (index: number) => {
    setExistingImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const toggleOccasion = (occasionValue: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasionValue)
        ? prev.filter((value) => value !== occasionValue)
        : [...prev, occasionValue]
    );
  };

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((value) => value !== collectionId)
        : [...prev, collectionId]
    );
  };

  const generateSku = () => {
    const seed = `${form.name || 'ITEM'}-${Date.now().toString().slice(-6)}`;
    const generated = seed
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/\s+/g, '-');
    setForm((prev) => ({ ...prev, sku: generated }));
  };

  const stopScanner = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    }
  };

  const applyScannedCode = (code: string) => {
    const normalized = code.trim();
    if (!normalized) return;
    setForm((prev) => ({ ...prev, sku: normalized.toUpperCase() }));
    setScannerOpen(false);
    setScannerError('');
    setManualCode('');
  };

  const startScanner = async () => {
    try {
      setScannerError('');
      setScannerLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      scannerStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const Detector = (window as any).BarcodeDetector;
      if (!Detector) {
        setScannerError('Barcode auto-scan is not supported on this browser. Enter code manually below.');
        return;
      }

      const detector = new Detector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length && codes[0]?.rawValue) {
            applyScannedCode(String(codes[0].rawValue));
          }
        } catch {
          // Ignore transient frame read failures.
        }
      }, 450);
    } catch {
      setScannerError('Could not access camera. Check browser permission, then try again.');
    } finally {
      setScannerLoading(false);
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required';
    if (!form.slug.trim()) nextErrors.slug = 'Slug is required';
    if (!form.sku.trim()) nextErrors.sku = 'Item code is required';
    if (!form.category) nextErrors.category = 'Category is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Valid sales price is required';
    if (form.costPrice && Number(form.costPrice) < 0) nextErrors.costPrice = 'Cost price cannot be negative';
    if (!form.stock || Number(form.stock) < 0) nextErrors.stock = 'Opening stock is required';
    if (!form.lowStockThreshold || Number(form.lowStockThreshold) < 0)
      nextErrors.lowStockThreshold = 'Low stock threshold must be 0 or more';
    if (mode === 'create' && newImages.length === 0) nextErrors.images = 'At least one image is required';
    if (mode === 'edit' && existingImages.length + newImages.length === 0)
      nextErrors.images = 'At least one image is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      'inventory.quantity': Math.max(0, Math.round(Number(form.stock))),
      'inventory.lowStockThreshold': form.lowStockAlert
        ? Math.max(0, Math.round(Number(form.lowStockThreshold)))
        : 0,
      openingStockDate: form.asOfDate,
      weight: form.weight ? Number(form.weight) : undefined,
      dimensions:
        form.length || form.width || form.height
          ? {
              length: form.length ? Number(form.length) : 0,
              width: form.width ? Number(form.width) : 0,
              height: form.height ? Number(form.height) : 0,
              unit: form.dimensionUnit,
            }
          : undefined,
      tags: form.tags
        ? form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      occasions: selectedOccasions,
      collections: selectedCollections,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isDigital: false,
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = buildPayload();

      if (mode === 'create') {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          if (Array.isArray(value) || typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        newImages.forEach((img) => formData.append('images', img.file));

        const res = await adminService.createProductWithImage(formData);
        if (!res.success) {
          alert(res.error || 'Failed to create item');
          return;
        }
        router.push('/admin/items');
        return;
      }

      if (!itemId) {
        alert('Missing item id');
        return;
      }

      const payloadForEdit: any = {
        ...payload,
        images: existingImages.map((img, idx) => ({
          url: img.url,
          publicId: img.publicId || '',
          alt: img.alt || form.name.trim() || 'Product image',
          isPrimary: idx === 0,
          sortOrder: idx + 1,
        })),
      };

      const res = await adminService.updateProduct(itemId, payloadForEdit);
      if (!res.success) {
        alert(res.error || 'Failed to update item');
        return;
      }

      if (newImages.length > 0) {
        await adminService.addProductImages(
          itemId,
          newImages.map((img) => img.file)
        );
      }

      router.push(`/admin/items/${itemId}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
        <div className="w-14" />
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          {activeTab === 'Images' && (
            <>
              <Field label="Item Images *" error={errors.images}>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                  <AddPhoto className="h-5 w-5" />
                  Upload Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  First existing image is used as primary. Use "Set Primary" to reorder.
                </p>
              </Field>

              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {existingImages.map((image, idx) => (
                    <div key={`${image.url}-${idx}`} className="group relative overflow-hidden rounded-lg border border-gray-200">
                      <img src={image.url} alt={`item-preview-${idx}`} className="h-28 w-full object-cover" />
                      {idx === 0 ? (
                        <span className="absolute left-2 top-2 rounded bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                          Primary
                        </span>
                      ) : null}
                      {idx !== 0 ? (
                        <button
                          type="button"
                          onClick={() => makeExistingPrimary(idx)}
                          className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-indigo-700"
                        >
                          Set Primary
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute right-2 top-2 rounded bg-black/70 p-1 text-white opacity-90 hover:bg-black"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {newImages.map((image, idx) => (
                    <div key={`${image.preview}-${idx}`} className="group relative overflow-hidden rounded-lg border border-gray-200">
                      <img src={image.preview} alt={`new-item-preview-${idx}`} className="h-28 w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute right-2 top-2 rounded bg-black/70 p-1 text-white opacity-90 hover:bg-black"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'Pricing' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Item Name *" error={errors.name}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ex: Wine Red Stone Bell Jhumkas"
                  />
                </Field>
                <Field label="Slug *" error={errors.slug}>
                  <input name="slug" value={form.slug} onChange={handleChange} className="input" />
                </Field>
                <Field label="Item Code *" error={errors.sku}>
                  <input name="sku" value={form.sku} onChange={handleChange} className="input" />
                </Field>
                <Field label="Category *" error={errors.category}>
                  <select name="category" value={form.category} onChange={handleChange} className="input">
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Sales Price *" error={errors.price}>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </Field>
                <Field label="Purchase Price" error={errors.costPrice}>
                  <input
                    type="number"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </Field>
                <Field label="MRP / Compare Price">
                  <input
                    type="number"
                    name="comparePrice"
                    value={form.comparePrice}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </Field>
              </div>
            </>
          )}

          {activeTab === 'Stock' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`Opening Stock (${stockUnitLabel}) *`} error={errors.stock}>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </Field>
                <Field label="As of Date">
                  <input type="date" name="asOfDate" value={form.asOfDate} onChange={handleChange} className="input" />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Low Stock Threshold" error={errors.lowStockThreshold}>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </Field>
                <label className="mt-6 inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="lowStockAlert"
                    checked={form.lowStockAlert}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Enable low stock alert
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={generateSku}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <Barcode className="h-5 w-5" />
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ScanBarcode className="h-5 w-5" />
                  Scan Barcode
                </button>
              </div>
            </>
          )}

          {activeTab === 'Other' && (
            <>
              <Field label="Key Highlights">
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  placeholder="One highlight per line (optional)"
                  className="input min-h-24"
                />
              </Field>
              <Field label="Description *" error={errors.description}>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input min-h-28"
                />
              </Field>
              <Field label="Tags (comma separated)">
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="input"
                  placeholder="jhumka, wedding, festive"
                />
              </Field>

              <Field label="Occasions">
                {occasions.length === 0 ? (
                  <p className="text-sm text-gray-500">No occasions available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {occasions.map((occasion) => {
                      const selected = selectedOccasions.includes(occasion.value);
                      return (
                        <button
                          key={occasion.value}
                          type="button"
                          onClick={() => toggleOccasion(occasion.value)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            selected
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {occasion.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>

              <Field label="Collections">
                {collections.length === 0 ? (
                  <p className="text-sm text-gray-500">No collections available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {collections.map((collection) => {
                      const id = String(collection._id || collection.id || '');
                      if (!id) return null;
                      const selected = selectedCollections.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleCollection(id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            selected
                              ? 'bg-emerald-600 text-white'
                              : 'border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {collection.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Field label="Length">
                  <input type="number" name="length" value={form.length} onChange={handleChange} className="input" />
                </Field>
                <Field label="Width">
                  <input type="number" name="width" value={form.width} onChange={handleChange} className="input" />
                </Field>
                <Field label="Height">
                  <input type="number" name="height" value={form.height} onChange={handleChange} className="input" />
                </Field>
                <Field label="Unit">
                  <select
                    name="dimensionUnit"
                    value={form.dimensionUnit}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Weight (g)">
                  <input type="number" name="weight" value={form.weight} onChange={handleChange} className="input" />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  Active item
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                  Featured item
                </label>
              </div>
            </>
          )}

          {activeTab === 'Party Wise Prices' && (
            <>
              <p className="text-sm text-gray-600">
                Party-wise pricing can be mapped to customer tiers in the next iteration. Use this note field for now.
              </p>
              <Field label="Party Pricing Notes">
                <textarea
                  name="partyWisePricingNotes"
                  value={form.partyWisePricingNotes}
                  onChange={handleChange}
                  className="input min-h-28"
                  placeholder="Example: Wholesale partners get 8% discount on this item."
                />
              </Field>
            </>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-3 flex items-center gap-3 border-t border-gray-200 bg-white px-3 py-3 sm:mx-0 sm:rounded-lg">
        <button
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="mr-2 inline h-4 w-4" />
          {saving ? 'Saving...' : mode === 'create' ? 'Save' : 'Update'}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.65rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: #fff;
        }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Scan Barcode</h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
              <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline />
            </div>

            {scannerLoading ? <p className="mt-2 text-sm text-gray-500">Starting camera...</p> : null}
            {scannerError ? <p className="mt-2 text-sm text-red-600">{scannerError}</p> : null}

            <div className="mt-3 flex items-center gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode manually"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => applyScannedCode(manualCode)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Use Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
