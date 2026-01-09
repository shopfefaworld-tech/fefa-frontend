'use client';

import { useState, useEffect } from 'react';
import { MdClose as Close, MdCloudUpload as Upload, MdImage as ImageIcon } from 'react-icons/md';
import Modal from './Modal';
import bannerService from '../../services/bannerService';
import adminService from '../../services/adminService';

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBannerModal({ isOpen, onClose, onSuccess }: AddBannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    position: 'hero',
    link: '',
    isActive: true,
    startDate: '',
    endDate: '',
    targetType: 'homepage',
    targetId: '',
    targetSlug: '',
    targetName: ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Target entity data
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  const positions = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'featured', label: 'Featured Section' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'footer', label: 'Footer' }
  ];

  const targetTypes = [
    { value: 'homepage', label: 'Homepage (Hero Carousel)' },
    { value: 'category', label: 'Category Page' },
    { value: 'collection', label: 'Collection Page' },
    { value: 'occasion', label: 'Occasion Page' }
  ];

  // Load categories, collections, and occasions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEntities();
    }
  }, [isOpen]);

  const loadEntities = async () => {
    setLoadingEntities(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const [categoriesResult, occasionsResponse, collectionsResponse] = await Promise.all([
        adminService.getAllCategories(),
        fetch(`${baseURL}/occasions?sortBy=sortOrder&sortOrder=asc`),
        fetch(`${baseURL}/collections?sortBy=sortOrder&sortOrder=asc`)
      ]);

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || []);
      }

      if (occasionsResponse.ok) {
        const occasionsData = await occasionsResponse.json();
        if (occasionsData.success) {
          setOccasions(occasionsData.data || []);
        }
      }

      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        if (collectionsData.success) {
          setCollections(collectionsData.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading entities:', err);
    } finally {
      setLoadingEntities(false);
    }
  };

  // Get the list of entities based on target type
  const getTargetEntities = () => {
    switch (formData.targetType) {
      case 'category':
        return categories.map(cat => ({ id: cat._id, slug: cat.slug, name: cat.name }));
      case 'collection':
        return collections.map(col => ({ id: col._id, slug: col.slug, name: col.name }));
      case 'occasion':
        return occasions.map(occ => ({ id: occ._id, slug: occ.value, name: occ.name }));
      default:
        return [];
    }
  };

  // Handle target entity selection
  const handleTargetEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const entities = getTargetEntities();
    const selectedEntity = entities.find(ent => ent.id === selectedValue);
    
    if (selectedEntity) {
      setFormData(prev => ({
        ...prev,
        targetId: selectedEntity.id,
        targetSlug: selectedEntity.slug,
        targetName: selectedEntity.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetId: '',
        targetSlug: '',
        targetName: ''
      }));
    }
  };

  // Handle target type change
  const handleTargetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      targetType: newType,
      targetId: '',
      targetSlug: '',
      targetName: ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Banner title is required';
    if (!formData.image) newErrors.image = 'Banner image is required';
    if (!formData.position) newErrors.position = 'Position is required';
    
    // Validate target selection if not homepage
    if (formData.targetType !== 'homepage' && !formData.targetId) {
      newErrors.targetEntity = `Please select a ${formData.targetType}`;
    }
    
    // Validate dates if provided
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const bannerData: any = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image,
        position: formData.position,
        link: formData.link.trim(),
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        targetType: formData.targetType
      };

      // Add target details if not homepage
      if (formData.targetType !== 'homepage') {
        bannerData.targetId = formData.targetId || undefined;
        bannerData.targetSlug = formData.targetSlug || undefined;
        bannerData.targetName = formData.targetName || undefined;
      }

      const result = await bannerService.createBanner(bannerData);
      
      if (result.success) {
        onSuccess();
        onClose();
        resetForm();
        alert('Banner created successfully!');
      } else {
        alert(result.error || 'Failed to create banner');
      }
    } catch (err) {
      console.error('Error creating banner:', err);
      alert('Failed to create banner: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      position: 'hero',
      link: '',
      isActive: true,
      startDate: '',
      endDate: '',
      targetType: 'homepage',
      targetId: '',
      targetSlug: '',
      targetName: ''
    });
    setImagePreview(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Banner"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="mx-auto h-32 w-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="banner-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="banner-image-upload"
                        name="banner-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Target Page Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display On *
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleTargetTypeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            >
              {targetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.targetType === 'homepage' 
                ? 'Banner will show in the homepage hero carousel'
                : `Banner will show on the selected ${formData.targetType} page`}
            </p>
          </div>

          {formData.targetType !== 'homepage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {formData.targetType.charAt(0).toUpperCase() + formData.targetType.slice(1)} *
              </label>
              <select
                name="targetEntity"
                value={formData.targetId}
                onChange={handleTargetEntityChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                  errors.targetEntity ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loadingEntities}
              >
                <option value="">
                  {loadingEntities ? 'Loading...' : `Select a ${formData.targetType}`}
                </option>
                {getTargetEntities().map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
              {errors.targetEntity && <p className="mt-1 text-sm text-red-600">{errors.targetEntity}</p>}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter banner title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.position ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {positions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
            {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            placeholder="Enter banner subtitle (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            placeholder="https://example.com (optional)"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty for immediate activation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
