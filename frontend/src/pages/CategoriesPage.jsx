import CategoryManager from '../components/CategoryManager';

export default function CategoriesPage() {
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Categories</h1>
      <CategoryManager />
    </div>
  );
}
