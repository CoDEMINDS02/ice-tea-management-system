"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  categories as demoCategories,
  products as demoProducts,
} from "@/data/menu";
import type { ProductChanges } from "@/lib/product-builder";
import type { Category, Product } from "@/types/menu";

/** Change the version suffix if Category or Product change, so old saves are ignored. */
const STORAGE_KEY = "iced-tea-house:catalog:v1";

type CatalogData = {
  categories: Category[];
  products: Product[];
};

/** Basic shape checks so broken or outdated saved data never reaches the UI. */
function isCategory(value: unknown): value is Category {
  if (typeof value !== "object" || value === null) return false;

  const category = value as Partial<Category>;

  return (
    typeof category.id === "string" &&
    typeof category.name === "string" &&
    typeof category.isActive === "boolean"
  );
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;

  const product = value as Partial<Product>;

  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.categoryId === "string" &&
    typeof product.price === "number" &&
    typeof product.isAvailable === "boolean"
  );
}

function createDemoCatalog(): CatalogData {
  return {
    categories: [...demoCategories],
    products: [...demoProducts],
  };
}

/** Saved catalog if it looks valid, otherwise the demo catalog. */
function loadCatalog(): CatalogData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (typeof parsed === "object" && parsed !== null) {
        const data = parsed as Partial<CatalogData>;

        if (
          Array.isArray(data.categories) &&
          Array.isArray(data.products) &&
          data.categories.every(isCategory) &&
          data.products.every(isProduct)
        ) {
          return { categories: data.categories, products: data.products };
        }
      }
    }
  } catch {
    // Storage blocked or data corrupted: fall back to the demo catalog.
  }

  return createDemoCatalog();
}

export type CategoryChanges = {
  name: string;
  /** An empty string removes the description. */
  description: string;
};

type CatalogContextValue = {
  categories: Category[];
  products: Product[];
  addCategory: (category: Category) => void;
  updateCategory: (categoryId: string, changes: CategoryChanges) => void;
  /** Hide (false) or show (true) a category. Categories are never deleted. */
  setCategoryActive: (categoryId: string, isActive: boolean) => void;
  addProduct: (product: Product) => void;
  /** Changes a product's details. Its id and availability stay the same. */
  updateProduct: (productId: string, changes: ProductChanges) => void;
  /** Products are never deleted, only made unavailable (or available again). */
  setProductAvailable: (productId: string, isAvailable: boolean) => void;
  /** Throws away all changes and restores the original demo catalog. */
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

type CatalogProviderProps = {
  children: ReactNode;
};

export function CatalogProvider({ children }: CatalogProviderProps) {
  // null until the browser has loaded saved data (or built the demo catalog).
  const [catalog, setCatalog] = useState<CatalogData | null>(null);

  // Load once after the first render, so server and browser HTML match.
  useEffect(() => {
    setCatalog(loadCatalog());
  }, []);

  // Save every change. Skipped until the first load has finished.
  useEffect(() => {
    if (!catalog) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [catalog]);

  const addCategory = useCallback((category: Category) => {
    setCatalog((current) =>
      current
        ? { ...current, categories: [...current.categories, category] }
        : current,
    );
  }, []);

  const updateCategory = useCallback(
    (categoryId: string, changes: CategoryChanges) => {
      const name = changes.name.trim();
      const description = changes.description.trim();

      setCatalog((current) =>
        current
          ? {
              ...current,
              categories: current.categories.map((category) =>
                category.id === categoryId
                  ? { ...category, name, description: description || undefined }
                  : category,
              ),
            }
          : current,
      );
    },
    [],
  );

  const setCategoryActive = useCallback(
    (categoryId: string, isActive: boolean) => {
      setCatalog((current) =>
        current
          ? {
              ...current,
              categories: current.categories.map((category) =>
                category.id === categoryId
                  ? { ...category, isActive }
                  : category,
              ),
            }
          : current,
      );
    },
    [],
  );

  const addProduct = useCallback((product: Product) => {
    setCatalog((current) =>
      current
        ? { ...current, products: [...current.products, product] }
        : current,
    );
  }, []);

  const updateProduct = useCallback(
    (productId: string, changes: ProductChanges) => {
      setCatalog((current) =>
        current
          ? {
              ...current,
              products: current.products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      name: changes.name,
                      description: changes.description,
                      categoryId: changes.categoryId,
                      price: changes.price,
                      sizes: changes.sizes,
                    }
                  : product,
              ),
            }
          : current,
      );
    },
    [],
  );

  const setProductAvailable = useCallback(
    (productId: string, isAvailable: boolean) => {
      setCatalog((current) =>
        current
          ? {
              ...current,
              products: current.products.map((product) =>
                product.id === productId ? { ...product, isAvailable } : product,
              ),
            }
          : current,
      );
    },
    [],
  );

  const resetCatalog = useCallback(() => {
    setCatalog(createDemoCatalog());
  }, []);

  const value = useMemo(
    () =>
      catalog
        ? {
            categories: catalog.categories,
            products: catalog.products,
            addCategory,
            updateCategory,
            setCategoryActive,
            addProduct,
            updateProduct,
            setProductAvailable,
            resetCatalog,
          }
        : null,
    [
      catalog,
      addCategory,
      updateCategory,
      setCategoryActive,
      addProduct,
      updateProduct,
      setProductAvailable,
      resetCatalog,
    ],
  );

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used inside a CatalogProvider");
  }

  return context;
}