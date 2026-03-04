import React, { useEffect, useState } from "react";

export default function ProductModal({ open, categories = [], mode, initialProduct, onClose, onSubmit }) {

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    stock: "",
    rating: "",
    image: ""
  });


  useEffect(() => {
    if (open && initialProduct) {
      setForm({
        name: initialProduct.name || "",
        categoryId: initialProduct.categoryId || "",
        description: initialProduct.description || "",
        price: initialProduct.price?.toString() || "",
        stock: initialProduct.stock?.toString() || "",
        rating: initialProduct.rating?.toString() || "",
        image: initialProduct.image || ""
      });
    } else if (!open) {

      setForm({ name: "", categoryId: "", description: "", price: "", stock: "", rating: "", image: "" });
    }
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === "edit" ? "Редактировать товар" : "Добавить товар";


  const handleSubmit = (e) => {
    e.preventDefault();
    

    if (!form.name.trim()) {
      alert("Введите название товара");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      alert("Укажите корректную цену (больше 0)");
      return;
    }
    if (!form.categoryId) {
      alert("Выберите категорию");
      return;
    }


    onSubmit({
      id: initialProduct?.id,
      name: form.name.trim(),
      categoryId: form.categoryId,
      description: form.description || "",
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      rating: form.rating ? Number(form.rating) : 0,
      image: form.image || ""
    });
  };


  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        

        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>


        <form className="form" onSubmit={handleSubmit}>
          

          <label className="label">
            Название *
            <input
              className="input"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Например, Электрогитара Fender"
              autoFocus
              required
            />
          </label>


<label className="label">
  Категория *
  <select 
    className="input" 
    value={form.categoryId}
    onChange={handleChange('categoryId')}
    required
  >
    <option value="" disabled>-- Выберите категорию --</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</label>


          <label className="label">
            Описание
            <textarea
              className="input"
              value={form.description}
              onChange={handleChange('description')}
              rows="3"
              placeholder="Краткое описание товара"
            />
          </label>


          <div className="form-row">
            <label className="label">
              Цена, ₽ *
              <input
                className="input"
                type="number"
                value={form.price}
                onChange={handleChange('price')}
                placeholder="9990"
                min="0"
                step="1"
                required
              />
            </label>
            <label className="label">
              На складе
              <input
                className="input"
                type="number"
                value={form.stock}
                onChange={handleChange('stock')}
                placeholder="10"
                min="0"
              />
            </label>
          </div>


          <div className="form-row">
            <label className="label">
              Рейтинг
              <input
                className="input"
                type="number"
                value={form.rating}
                onChange={handleChange('rating')}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </label>
            <label className="label">
              Фото (URL)
              <input
                className="input"
                value={form.image}
                onChange={handleChange('image')}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn--primary">
              {mode === "edit" ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
