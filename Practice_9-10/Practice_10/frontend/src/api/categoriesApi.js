import { api } from "./apiClient";


export async function getCategories() {
  return (await api.get("/categories")).data;
}

export async function getCategoryById(id) {
  return (await api.get(`/categories/${id}`)).data;
}

export async function getCategoryWithProducts(id) {
  return (await api.get('/categories/${id}/with-products')).data;
}

export async function createCategory(category) {
  return (await api.post("/categories", category)).data;
}


export async function updateCategory(id, patch) {
  return (await api.patch(`/categories/${id}`, patch)).data;
}


export async function deleteCategory(id) {
  return (await api.delete(`/categories/${id}`)).data;
}