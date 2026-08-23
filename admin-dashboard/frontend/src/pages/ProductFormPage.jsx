import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    icon: "combo",
    theme: "combo",
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    sku: "",
    category: "",
    stock_quantity: "",
    image_url: "",
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res);
    } catch {
      /* ignore */
    }
  };

  const fetchProduct = async () => {
    if (!isEditing) return;
    setLoading(true);
    try {
      const res = await api.getProduct(id);
      const primaryVariant = res.variants[0];
      setFormData({
        icon: res.icon,
        theme: res.theme,
        name: res.name,
        description: res.description || "",
        price: String(primaryVariant?.price || ""),
        compare_at_price: primaryVariant?.mrp ? String(primaryVariant.mrp) : "",
        sku: res.slug,
        category: res.category,
        stock_quantity: String(
          res.variants.reduce((total, variant) => total + variant.stock, 0),
        ),
        image_url: "",
        is_active: true,
      });
    } catch (err) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.price || Number(formData.price) <= 0)
      errors.price = "Valid price is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.category) errors.category = "Category is required";
    if (formData.stock_quantity === "" || Number(formData.stock_quantity) < 0) {
      errors.stock_quantity = "Valid stock quantity is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");

    const payload = {
      slug: formData.sku
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      icon: formData.icon || "combo",
      theme: formData.theme || "combo",
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      variants: [
        {
          label: "Standard",
          price: Number(formData.price),
          mrp: formData.compare_at_price
            ? Number(formData.compare_at_price)
            : null,
          stock: Number(formData.stock_quantity),
        },
      ],
    };

    try {
      if (isEditing) {
        await api.updateProduct(id, payload);
      } else {
        await api.createProduct(payload);
      }
      navigate("/products");
    } catch (err) {
      if (err.status === 422 && err.message) {
        // Try to parse validation errors
        try {
          const detail = JSON.parse(err.message);
          if (detail.detail && Array.isArray(detail.detail)) {
            const errors = {};
            detail.detail.forEach((d) => {
              if (d.loc && d.loc[1]) {
                errors[d.loc[1]] = d.msg;
              }
            });
            setFieldErrors(errors);
            return;
          }
        } catch {
          /* not JSON */
        }
      }
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Update product details"
              : "Create a new product for your store"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6" noValidate>
        {error && (
          <div
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Basic Info */}
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </legend>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`input ${fieldErrors.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                placeholder="Enter product name"
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Describe your product..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="label">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input ${fieldErrors.category ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="sku" className="label">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`input ${fieldErrors.sku ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  placeholder="Unique product code"
                  required
                />
                {fieldErrors.sku && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.sku}</p>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Pricing */}
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-4">
            Pricing
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="label">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`input ${fieldErrors.price ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                placeholder="0.00"
                required
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="compare_at_price" className="label">
                Compare at Price (₹)
              </label>
              <input
                id="compare_at_price"
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_at_price}
                onChange={handleChange}
                className="input"
                placeholder="0.00 (optional)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Original price to show discount
              </p>
            </div>
          </div>
        </fieldset>

        {/* Inventory */}
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-4">
            Inventory
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock_quantity" className="label">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className={`input ${fieldErrors.stock_quantity ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                placeholder="0"
                required
              />
              {fieldErrors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.stock_quantity}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <div className="flex items-center h-10">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Active (visible on storefront)
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Image */}
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-4">
            Product Image
          </legend>
          <div>
            <label htmlFor="image_url" className="label">
              Image URL
            </label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter a direct link to the product image
            </p>
            {formData.image_url && (
              <div className="mt-3">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </span>
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
