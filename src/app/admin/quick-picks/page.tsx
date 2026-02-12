'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  MdAdd as Plus,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdRefresh as Refresh,
  MdToggleOn as ToggleOn,
  MdToggleOff as ToggleOff,
  MdClose as X,
  MdSave as Save,
  MdLocalOffer as Tag,
  MdImage as ImageIcon,
  MdCloudUpload as Upload,
} from 'react-icons/md';

interface QuickPickProduct {
  _id: string;
  name: string;
  price: number;
  comparePrice: number;
  image: string;
  isActive: boolean;
}

export default function QuickPicksPage() {
  const [products, setProducts] = useState<QuickPickProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<QuickPickProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    comparePrice: '',
    image: '',
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = (includeJsonContentType = true) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${
        typeof window !== 'undefined' ? localStorage.getItem('fefa_access_token') || '' : ''
      }`,
    };

    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  const fetchQuickPicks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/quick-picks/all`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quick picks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickPicks();
  }, []);

  // Handle toggle active status
  const handleToggleActive = async (id: string) => {
    try {
      await fetch(`${apiUrl}/quick-picks/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      fetchQuickPicks();
    } catch (error) {
      console.error('Failed to toggle quick pick', error);
      alert('Failed to toggle quick pick');
    }
  };

  // Handle delete product
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Quick Pick?')) {
      try {
        await fetch(`${apiUrl}/quick-picks/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        fetchQuickPicks();
      } catch (error) {
        console.error('Failed to delete quick pick', error);
        alert('Failed to delete quick pick');
      }
    }
  };

  // Handle edit product
  const handleEdit = (product: QuickPickProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      comparePrice: product.comparePrice.toString(),
      image: product.image,
      imageFile: null,
    });
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  // Handle add new product
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      comparePrice: '',
      image: '',
      imageFile: null,
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({
        ...prev,
        image: result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const comparePrice = parseFloat(formData.comparePrice);
    
    if (price > 200) {
      alert('Quick Pick products must be under ₹200');
      return;
    }

    try {
      // If we have an image file, use FormData so the backend can upload to Cloudinary
      if (formData.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('price', price.toString());
        formDataToSend.append('comparePrice', comparePrice.toString());
        formDataToSend.append('image', formData.imageFile);

        const url = editingProduct
          ? `${apiUrl}/quick-picks/${editingProduct._id}`
          : `${apiUrl}/quick-picks`;

        const method = editingProduct ? 'PUT' : 'POST';

        await fetch(url, {
          method,
          headers: getAuthHeaders(false),
          body: formDataToSend,
        });
      } else {
        // Fallback: allow keeping existing image on edit, but require image on create
        if (!editingProduct) {
          alert('Please upload a product image');
          return;
        }

        const payload = {
          name: formData.name,
          price,
          comparePrice,
          image: formData.image || editingProduct.image,
        };

        await fetch(`${apiUrl}/quick-picks/${editingProduct._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      await fetchQuickPicks();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save quick pick', error);
      alert('Failed to save quick pick');
    }
  };

  // Calculate discount percentage
  const getDiscountPercent = (price: number, comparePrice: number) => {
    if (comparePrice > price) {
      return Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Quick Picks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
            Manage low-cost products shown in cart to help customers reach discount thresholds
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quick Pick
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Tag className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Discount Thresholds</h3>
            <p className="text-sm text-amber-700 mt-1">
              Quick Picks help customers reach discount thresholds:
              <span className="font-semibold"> ₹2,000 for 10% OFF</span> and 
              <span className="font-semibold"> ₹4,000 for 15% OFF</span>. 
              All products should be under ₹200.
            </p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Pick Products ({products.length})
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product._id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-amber-600">₹{product.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{product.comparePrice}</span>
                      <span className="text-xs text-red-500 font-medium">
                        -{getDiscountPercent(product.price, product.comparePrice)}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(product._id)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {product.isActive ? (
                          <ToggleOn className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleOff className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compare Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-amber-600">₹{product.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400 line-through">₹{product.comparePrice}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      -{getDiscountPercent(product.price, product.comparePrice)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(product._id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Quick Picks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a Quick Pick product.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quick Pick
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsModalOpen(false)}
            />
            
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingProduct ? 'Edit Quick Pick' : 'Add Quick Pick'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="e.g., Pearl Stud Mini"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="200"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="49"
                        />
                        <p className="mt-1 text-xs text-gray-500">Max: ₹200</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Compare Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.comparePrice}
                          onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="99"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="mt-1 flex justify-center px-4 pt-4 pb-5 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {imagePreview || formData.image ? (
                            <div className="relative inline-block">
                              <img
                                src={imagePreview || formData.image}
                                alt="Quick pick preview"
                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData((prev) => ({
                                    ...prev,
                                    image: '',
                                    imageFile: null,
                                  }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                              <div className="flex text-sm text-gray-600 justify-center">
                                <label
                                  htmlFor="quick-pick-image-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                                >
                                  <span className="inline-flex items-center">
                                    <Upload className="h-4 w-4 mr-1" />
                                    Upload an image
                                  </span>
                                  <input
                                    id="quick-pick-image-upload"
                                    name="quick-pick-image-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 sm:mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white focus:outline-none"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingProduct ? 'Save Changes' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
