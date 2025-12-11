'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddProductModal from '../../../../components/admin/AddProductModal';

export default function CreateProductPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/admin/products');
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.push('/admin/products');
  };

  return (
    <AddProductModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}

