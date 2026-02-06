'use client';

import { useParams } from 'next/navigation';
import ItemForm from '@/components/admin/items/ItemForm';

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;

  return <ItemForm mode="edit" itemId={id} />;
}

