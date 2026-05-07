import React, { useState, useEffect, useRef } from "react";
import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Package,
  Eye,
  Settings,
  Plus,
  Trash2,
  Download,
  Search,
  Grid3x3,
  Printer,
  ImageIcon,
  Save,
  FileDown,
  GripVertical,
  Filter,
  X,
  Loader2,
  CheckCircle,
  FileText,
  Images,
  ChevronRight,
  Menu,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// --- Types ---

interface Product {
  id: string;
  code: string;
  description: string;
  category: string;
  image: string | null;
}

interface AppSettings {
  primaryColor: string;
  accentColor: string;
  gridCols: number;
  gridRows: number;
  headerText: string;
  footerText: string;
  showWatermark: boolean;
  watermarkImage: string | null;
  showPageNumbers: boolean;
  cardBorderRadius: number;
  pageMargin: number;
  fontFamily: string;
  // New layout controls
  photoHeightRatio: number; // 0-100
  codeWidthRatio: number; // 0-100
  cardPadding: number; // px
  gridGap: number; // px
  showCardShadow: boolean;
  cardBorderColor: string;
  // Profiles
  activeProfileName?: string;
}

interface LayoutProfile {
  id: string;
  name: string;
  settings: AppSettings;
}

// --- Defaults ---

const defaultSettings: AppSettings = {
  primaryColor: "#0056b3",
  accentColor: "#eff6ff",
  gridCols: 3,
  gridRows: 4,
  headerText: "GRUPO BOTO PEÇAS - CATÁLOGO V4",
  footerText: "Tecnologia e paixão sobre rodas | www.botopecas.com.br",
  showWatermark: true,
  watermarkImage: null,
  showPageNumbers: true,
  cardBorderRadius: 8,
  pageMargin: 10,
  fontFamily: "Inter, sans-serif",
  // Layout defaults
  photoHeightRatio: 75,
  codeWidthRatio: 35,
  cardPadding: 8,
  gridGap: 16,
  showCardShadow: false,
  cardBorderColor: "#000000",
};

const initialProducts: Product[] = [
  {
    id: "1",
    code: "5073",
    description: "PISTAO HILUX 3.0 1KZTE STD CCANAL",
    category: "Pistão",
    image: null,
  },
  {
    id: "2",
    code: "1973",
    description: "PISTAO STD L200 3.2 16V PAJERO FULL 4M41 (2001 A 2012)",
    category: "Pistão",
    image: null,
  },
  {
    id: "3",
    code: "2036",
    description:
      "KIT JUNTA TAMPA VALVULAS H2321 TPARTS HILUX 2.5 16V 2004 A 2012",
    category: "Juntas",
    image: null,
  },
  {
    id: "4",
    code: "1186",
    description: "JUNTA MOTO L200 TRITON 3.2 DIESEL 2007... 3PIC",
    category: "Juntas",
    image: null,
  },
  {
    id: "5",
    code: "6204",
    description: "SUPORTE FILTRO COMB L200 TRITON 3.2 16V 2010 A 2012",
    category: "Suporte",
    image: null,
  },
  {
    id: "6",
    code: "4085",
    description: "RADIADOR L200 TRITON 2.4 AUTO ANO 2017/... FRONTIER 74549",
    category: "Arrefecimento",
    image: null,
  },
];

// --- Helper Components ---

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Excluir",
  confirmColor = "bg-red-600 hover:bg-red-700",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${confirmColor.replace("bg-", "bg-").replace("hover:bg-", "/10 text-")}`}
                >
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{message}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${confirmColor}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-0.5 text-gray-300 hover:text-blue-500 cursor-help transition-colors"
      >
        <Settings size={12} className="rotate-45" />
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-medium rounded-xl shadow-2xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductCard = (props: {
  product: Product;
  settings: AppSettings;
  key?: string | number;
}) => {
  const { product, settings } = props;
  return (
    <div
      className={`h-full bg-white overflow-hidden relative border group transition-shadow ${settings.showCardShadow ? "shadow-lg" : ""}`}
      style={{
        display: "block",
        boxSizing: "border-box",
        borderRadius: `${settings.cardBorderRadius}px`,
        borderColor: settings.cardBorderColor,
        borderWidth: "1px",
      }}
    >
      <div
        className="relative w-full overflow-hidden flex items-center justify-center bg-white"
        style={{
          boxSizing: "border-box",
          height: `${settings.photoHeightRatio}%`,
          padding: `${settings.cardPadding}px`,
        }}
      >
        {product?.image ? (
          <img
            src={product.image}
            alt={product.description || ""}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center"
            style={{ color: "#d1d5db" }}
          >
            <ImageIcon
              size={settings.photoHeightRatio > 50 ? 48 : 24}
              strokeWidth={1}
            />
            {settings.photoHeightRatio > 30 && (
              <span
                className="text-[10px] mt-1 font-medium uppercase tracking-widest"
                style={{ color: "#6b7280" }}
              >
                Sem Imagem
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className="w-full shrink-0 bg-white"
        style={{
          boxSizing: "border-box",
          height: `${100 - settings.photoHeightRatio}%`,
          borderTop: `1px solid ${settings.cardBorderColor}`,
          display: "table",
          tableLayout: "fixed",
        }}
        id={`footer-${product?.id || Math.random()}`}
      >
        <div
          style={{
            boxSizing: "border-box",
            display: "table-cell",
            verticalAlign: "middle",
            backgroundColor: settings.primaryColor,
            color: "#fff",
            width: `${settings.codeWidthRatio}%`,
            borderRight: `1px solid ${settings.cardBorderColor}`,
            textAlign: "center",
            padding: "2px",
          }}
        >
          <div
             className="font-black"
             style={{ 
               fontSize: settings.codeWidthRatio < 30 ? "0.75rem" : "1rem",
               lineHeight: "1.2",
               margin: "0",
             }}
          >
            {product?.code || "---"}
          </div>
        </div>
        <div
          style={{
            boxSizing: "border-box",
            display: "table-cell",
            verticalAlign: "middle",
            backgroundColor: "#fff",
            color: "#000",
            width: `${100 - settings.codeWidthRatio}%`,
            textAlign: "center",
            padding: "2px 4px",
          }}
        >
          <div 
             className="font-bold uppercase mx-auto"
             style={{ 
               display: "block",
               fontSize: "8.5px",
               lineHeight: "1.3",
               wordBreak: "break-word",
               margin: "0",
             }}
          >
            {product?.description || "SEM DESCRIÇÃO"}
          </div>
        </div>
      </div>
    </div>
  );
};

const CatalogPage = (props: {
  pageProducts: Product[];
  pageIndex: number;
  totalPages: number;
  settings: AppSettings;
  key?: string | number;
}) => {
  const { pageProducts, pageIndex, totalPages, settings } = props;
  const itemsPerPage = settings.gridCols * settings.gridRows;
  const placeholders = Array.from({
    length: Math.max(0, itemsPerPage - pageProducts.length),
  });

  return (
    <div
      id={`catalog-page-${pageIndex}`}
      className="catalog-page bg-white relative flex flex-col shadow-2xl mx-auto overflow-hidden text-gray-900"
      style={{
        width: "210mm",
        height: "297mm",
        padding: `${settings.pageMargin}mm`,
        fontFamily: settings.fontFamily,
        boxSizing: "border-box",
      }}
    >
      {/* Background Watermark Pattern */}
      {settings.showWatermark && (
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-wrap content-start justify-start overflow-hidden rotate-[-25deg] scale-125 origin-center">
          {settings.watermarkImage
            ? Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1/3 p-12 flex items-center justify-center"
                >
                  <img
                    src={settings.watermarkImage!}
                    className="max-w-full max-h-32 grayscale brightness-0 object-contain"
                    alt=""
                  />
                </div>
              ))
            : Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full text-7xl font-black whitespace-nowrap mb-12 flex gap-12"
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j}>{settings.headerText.split("-")[0]}</span>
                  ))}
                </div>
              ))}
        </div>
      )}

      {/* Header - Fixed Height */}
      <header
        className="h-24 flex items-end justify-between border-b-4 mb-6 z-10 relative shrink-0"
        style={{ borderColor: settings.primaryColor }}
      >
        <div className="pb-4">
          <h1
            className="text-3xl font-black italic tracking-tighter"
            style={{ color: settings.primaryColor }}
          >
            {settings.headerText.split("-")[0]}
            <span
              className="font-normal not-italic ml-2 uppercase text-xl"
              style={{ color: "#9ca3af" }}
            >
              {settings.headerText.split("-")[1] || ""}
            </span>
          </h1>
        </div>
        <div className="text-right pb-4">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#6b7280" }}
          >
            Qualidade e Performance
          </p>
        </div>
      </header>

      {/* Grid Area - Flex Fill but Constrained to available height */}
      <div className="flex-grow min-h-0 z-10 relative overflow-hidden">
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: `repeat(${settings.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${settings.gridRows}, minmax(0, 1fr))`,
            gap: `${settings.gridGap}px`,
          }}
        >
          {pageProducts.map((p) => (
            <ProductCard key={p.id} product={p} settings={settings} />
          ))}
          {placeholders.map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border border-dashed rounded-lg flex items-center justify-center opacity-40"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div
                className="w-full h-full"
                style={{ backgroundColor: "#f9fafb" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Fixed Height */}
      <footer
        className="h-14 mt-6 flex items-center justify-between border-t text-xs z-10 relative shrink-0"
        style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
      >
        <span className="font-bold uppercase tracking-wide">
          {settings.footerText}
        </span>
        {settings.showPageNumbers && (
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-[2px]"
              style={{ backgroundColor: "#d1d5db" }}
            />
            <span
              className="font-black px-4 py-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: "#000000", color: "#ffffff" }}
            >
              {pageIndex + 1}
            </span>
          </div>
        )}
      </footer>
    </div>
  );
};

// --- Main Views ---

const ProductManager = ({
  products,
  setProducts,
  settings,
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: AppSettings;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product | null>(null);
  const [errors, setErrors] = useState<{
    code?: string;
    description?: string;
    category?: string;
  }>({});
  const [search, setSearch] = useState("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id?: string;
    bulk?: boolean;
  } | null>(null);

  const displayProducts = Array.isArray(products) ? [...products] : [];
  if (editingId && editingId.startsWith("temp-") && formData) {
    if (!displayProducts.find((p) => p && p.id === editingId)) {
      displayProducts.unshift(formData);
    }
  }

  const filtered = displayProducts.filter((p) => {
    if (!p) return false;
    const searchLower = (search || "").toLowerCase();
    const code = (p.code || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    return (
      code.includes(searchLower) ||
      desc.includes(searchLower) ||
      cat.includes(searchLower)
    );
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    if (editingId && selectedIds.has(editingId)) {
      setEditingId(null);
      setFormData(null);
    }
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      let importedProducts: Product[] = [];

      try {
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          importedProducts = Array.isArray(data) ? data : [data];
        } else if (file.name.endsWith(".csv")) {
          const lines = text.split(/\r?\n/);
          if (lines.length < 2) throw new Error("Arquivo vazio ou inválido");

          const headers = lines[0]
            .split(/[;,]/)
            .map((h) => h.trim().toLowerCase());

          importedProducts = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line, lidx) => {
              const values = line.split(/[;,]/).map((v) => v.trim());
              const p: any = { id: `import-${Date.now()}-${lidx}` };

              headers.forEach((header, index) => {
                if (header.includes("cod")) p.code = values[index];
                else if (header.includes("desc")) p.description = values[index];
                else if (header.includes("cat")) p.category = values[index];
                else if (header.includes("img") || header.includes("url"))
                  p.image = values[index] || null;
              });

              return {
                id: p.id,
                code: p.code || "S/C",
                description: p.description || "",
                category: p.category || "",
                image: p.image || null,
              } as Product;
            });
        }

        if (importedProducts.length > 0) {
          if (confirm(`Deseja importar ${importedProducts.length} produtos?`)) {
            setProducts((prev) => [...importedProducts, ...prev]);
          }
        }
      } catch (err) {
        alert(
          "Erro ao processar arquivo. Verifique o formato (JSON ou CSV com cabeçalhos).",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBulkExport = () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    const dataStr = JSON.stringify(selectedProducts, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `export_produtos_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setErrors({});
  };

  const handleNew = () => {
    const tempId = `temp-${Date.now()}`;
    const newP: Product = {
      id: tempId,
      code: "",
      description: "",
      category: "",
      image: null,
    };
    setEditingId(tempId);
    setFormData(newP);
    setErrors({});
  };

  const save = () => {
    if (!formData) return;

    const newErrors: {
      code?: string;
      description?: string;
      category?: string;
    } = {};

    const trimmedCode = formData.code.trim();
    if (!trimmedCode) {
      newErrors.code = "O código é obrigatório";
    } else if (!/^[a-z0-9]+$/i.test(trimmedCode)) {
      newErrors.code = "O código deve ser alfanumérico (letras e números)";
    }

    if (!formData.description.trim()) {
      newErrors.description = "A descrição é obrigatória";
    }

    if (!formData.category.trim()) {
      newErrors.category = "A categoria é obrigatória";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (formData.id.startsWith("temp-")) {
      // Commit new product
      const committedProduct = { ...formData, id: Date.now().toString() };
      setProducts((prev) => [committedProduct, ...prev]);
    } else {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) => (p.id === formData.id ? formData : p)),
      );
    }

    setEditingId(null);
    setFormData(null);
    setErrors({});
  };

  const remove = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData(null);
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop
  const onDragStart = (idx: number) => setDraggedIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newItems = [...products];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, draggedItem);

    setProducts(newItems);
    setDraggedIdx(idx);
  };

  return (
    <div className="flex h-full gap-6">
      {/* List */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className={`p-2 rounded-lg border transition-all ${selectedIds.size > 0 && selectedIds.size === filtered.length ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-50 border-gray-200 text-gray-400"}`}
              title="Selecionar Todos"
            >
              {selectedIds.size > 0 && selectedIds.size === filtered.length ? (
                <CheckCircle size={18} />
              ) : (
                <div className="w-[18px] h-[18px] rounded border-2 border-gray-300" />
              )}
            </button>
          </div>
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por código, descrição ou categoria..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              id="bulk-import-input"
              className="hidden"
              accept=".json,.csv"
              onChange={handleBulkImport}
            />
            <button
              onClick={() =>
                document.getElementById("bulk-import-input")?.click()
              }
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg border border-gray-200 transition-colors"
              title="Importar (JSON/CSV)"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> Novo Produto
            </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between overflow-hidden"
            >
              <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                {selectedIds.size}{" "}
                {selectedIds.size === 1
                  ? "item selecionado"
                  : "itens selecionados"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkExport}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Download size={14} /> Exportar JSON
                </button>
                <button
                  onClick={() => setDeleteConfirm({ bulk: true })}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={14} /> Excluir Massa
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {filtered.map((p, idx) => (
            <motion.div
              layout
              key={p.id}
              draggable={search === "" && !p.id.startsWith("temp-")}
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              className={`
                group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer select-none
                ${editingId === p.id ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"}
                ${selectedIds.has(p.id) ? "bg-blue-50/50 border-blue-200" : ""}
              `}
              onClick={() => handleEdit(p)}
            >
              <div
                onClick={(e) => toggleSelect(p.id, e)}
                className={`p-1 rounded flex shrink-0 transition-colors ${selectedIds.has(p.id) ? "text-blue-600" : "text-gray-300 group-hover:text-gray-400"}`}
              >
                {selectedIds.has(p.id) ? (
                  <CheckCircle size={20} />
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-gray-200 bg-white" />
                )}
              </div>
              <div className="text-gray-200 group-hover:text-gray-400 shrink-0">
                <GripVertical size={18} />
              </div>
              <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImageIcon size={20} className="text-gray-200" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900">{p.code}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase">
                    {p.category || "Sem Categoria"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {p.description}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ id: p.id });
                  }}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
          {products.length} itens no catálogo
        </div>
      </div>

      {/* Editor */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {formData ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Editar Detalhes
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData(null);
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} /> Salvar Produto
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${errors.code ? "text-red-500" : "text-gray-400"}`}
                  >
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border-none rounded-xl text-sm font-bold focus:ring-2 transition-all text-gray-900 ${errors.code ? "bg-red-50 ring-2 ring-red-100 placeholder-red-300" : "bg-gray-50 focus:ring-blue-500"}`}
                    value={formData.code}
                    placeholder="Ex: AB123"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      });
                      if (errors.code)
                        setErrors({ ...errors, code: undefined });
                    }}
                  />
                  {errors.code && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                      {errors.code}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${errors.category ? "text-red-500" : "text-gray-400"}`}
                  >
                    Categoria
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border-none rounded-xl text-sm font-bold focus:ring-2 transition-all text-gray-900 ${errors.category ? "bg-red-50 ring-2 ring-red-100 placeholder-red-300" : "bg-gray-50 focus:ring-blue-500"}`}
                    value={formData.category}
                    placeholder="Ex: Motor"
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (errors.category)
                        setErrors({ ...errors, category: undefined });
                    }}
                  />
                  {errors.category && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${errors.description ? "text-red-500" : "text-gray-400"}`}
                >
                  Descrição Técnica completa
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-4 py-2.5 border-none rounded-xl text-sm font-bold focus:ring-2 transition-all text-gray-900 resize-none ${errors.description ? "bg-red-50 ring-2 ring-red-100 placeholder-red-300" : "bg-gray-50 focus:ring-blue-500"}`}
                  value={formData.description}
                  placeholder="Descreva as especificações do produto..."
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      description: e.target.value.toUpperCase(),
                    });
                    if (errors.description)
                      setErrors({ ...errors, description: undefined });
                  }}
                />
                {errors.description && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Upload da Imagem
                </label>
                <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 text-center">
                  {formData.image ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={formData.image}
                          className="max-h-60 rounded-lg shadow-md mx-auto"
                        />
                        <button
                          onClick={() =>
                            setFormData({ ...formData, image: null })
                          }
                          className="absolute -top-3 -right-3 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="space-y-3 cursor-pointer"
                      onClick={() =>
                        document.getElementById("img-upload")?.click()
                      }
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-all">
                        <Upload size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Clique para selecionar imagem
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                          PNG, JPG ou WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="img-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImage}
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Prévia do Card no Catálogo
                </h4>
                <div className="w-64 aspect-[3/4] mx-auto scale-90 origin-top shadow-xl ring-1 ring-gray-200 rounded-lg overflow-hidden">
                  <ProductCard product={formData} settings={settings} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <FileText size={40} strokeWidth={1} className="opacity-30" />
            </div>
            <h4 className="text-lg font-bold text-gray-400">
              Nenhum produto selecionado
            </h4>
            <p className="text-sm font-medium mt-1">
              Escolha um item da lista ao lado para editar os detalhes técnicos
              ou a imagem comercial.
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.bulk ? "Excluir em Massa" : "Excluir Produto"}
        message={
          deleteConfirm?.bulk
            ? `Tem certeza que deseja excluir os ${selectedIds.size} itens selecionados? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este produto do catálogo? Esta ação não pode ser desfeita."
        }
        onConfirm={() => {
          if (deleteConfirm?.bulk) {
            handleBulkDelete();
          } else if (deleteConfirm?.id) {
            remove(deleteConfirm.id);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

const SettingsManager = ({
  settings,
  setSettings,
  profiles,
  setProfiles,
}: {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  profiles: LayoutProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<LayoutProfile[]>>;
}) => {
  const [newProfileName, setNewProfileName] = useState("");
  const [showSaveProfile, setShowSaveProfile] = useState(false);

  const saveProfile = () => {
    if (!newProfileName.trim()) return;
    const newProfile: LayoutProfile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      settings: { ...settings, activeProfileName: newProfileName.trim() },
    };
    setProfiles([...profiles, newProfile]);
    setNewProfileName("");
    setShowSaveProfile(false);
  };

  const loadProfile = (p: LayoutProfile) => {
    setSettings(p.settings);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProfiles(profiles.filter((p) => p.id !== id));
  };

  const fonts = [
    { name: "Inter (Sans)", value: "Inter, sans-serif" },
    { name: "Outfit (Modern)", value: "Outfit, sans-serif" },
    { name: "Space Grotesk", value: "Space Grotesk, sans-serif" },
    { name: "Playfair (Serif)", value: "Playfair Display, serif" },
    { name: "JetBrains (Mono)", value: "JetBrains Mono, monospace" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profiles Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown size={20} className="text-blue-600" /> Templates
              </div>
              <button
                onClick={() => setShowSaveProfile(true)}
                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Salvar layout atual como novo template"
              >
                <Plus size={16} />
              </button>
            </h3>

            <AnimatePresence>
              {showSaveProfile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 space-y-3 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Nome do template..."
                    className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-2.5 text-gray-900"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowSaveProfile(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {profiles.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Nenhum template
                  </p>
                </div>
              ) : (
                profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => loadProfile(p)}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${settings.activeProfileName === p.name ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-gray-100 hover:border-blue-200"}`}
                  >
                    <span className="text-xs font-bold text-gray-700 truncate flex-1">
                      {p.name}
                    </span>
                    <button
                      onClick={(e) => deleteProfile(p.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-blue-600" /> Geral
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  Título do Cabeçalho
                  <InfoTooltip text="O texto principal que aparece no topo de todas as páginas do catálogo." />
                </label>
                <input
                  className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-3 text-gray-900"
                  value={settings.headerText}
                  onChange={(e) =>
                    setSettings({ ...settings, headerText: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  Rodapé / Link
                  <InfoTooltip text="Informação institucional exibida na base de cada página (ex: site, instagram)." />
                </label>
                <input
                  className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-3 text-gray-900"
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings({ ...settings, footerText: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  Família de Fontes
                  <InfoTooltip text="Altera a tipografia global do catálogo. Escolha entre estilos modernos, clássicos ou técnicos." />
                </label>
                <select
                  className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold p-3 text-gray-900"
                  value={settings.fontFamily}
                  onChange={(e) =>
                    setSettings({ ...settings, fontFamily: e.target.value })
                  }
                >
                  {fonts.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                    Colunas
                    <InfoTooltip text="Quantidade de itens na horizontal por página." />
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold p-3 text-gray-900"
                    value={settings.gridCols}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gridCols: Number(e.target.value),
                      })
                    }
                  >
                    {[2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v} col
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                    Linhas
                    <InfoTooltip text="Quantidade de itens na vertical por página." />
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold p-3 text-gray-900"
                    value={settings.gridRows}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gridRows: Number(e.target.value),
                      })
                    }
                  >
                    {[2, 3, 4, 5, 6].map((v) => (
                      <option key={v} value={v}>
                        {v} lin
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={settings.showWatermark}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showWatermark: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-gray-700 flex-1">
                    Marca D'água
                  </span>
                  <InfoTooltip text="Exibe o logo ou título da marca repetido no fundo da página de forma sutil." />
                </label>

                {settings.showWatermark && (
                  <div className="space-y-2 mt-4 px-3 pb-3 border border-blue-100 bg-blue-50/20 rounded-xl">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mt-2 flex items-center">
                      Logotipo da Marca D'água
                      <InfoTooltip text="Upload de imagem para fundo. Substitui o texto dinâmico pela imagem grayscale." />
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 bg-white border-2 border-dashed border-gray-200 p-3 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1">
                        {settings.watermarkImage ? (
                          <div className="relative group">
                            <img
                              src={settings.watermarkImage}
                              className="h-8 object-contain grayscale opacity-50"
                              alt=""
                            />
                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center rounded">
                              <Upload size={12} className="text-blue-600" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={16} className="text-gray-400" />
                            <span className="text-[9px] font-bold text-gray-500 uppercase">
                              Logo Custom
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setSettings({
                                  ...settings,
                                  watermarkImage: reader.result as string,
                                });
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {settings.watermarkImage && (
                        <button
                          onClick={() =>
                            setSettings({ ...settings, watermarkImage: null })
                          }
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                          title="Voltar para texto"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={settings.showPageNumbers}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showPageNumbers: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-gray-700 flex-1">
                    Numeração de Páginas
                  </span>
                  <InfoTooltip text="Adiciona o número atual da página no canto inferior direito." />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Card Designer (Advanced) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Grid3x3 size={20} />
                </div>
                Card Designer (IA V4)
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                Ajuste Dinâmico
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Presets de Estilo
                    <InfoTooltip text="Combinações pré-definidas para trocar o visual completamente em um clique." />
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          primaryColor: "#0f172a",
                          cardBorderColor: "#e2e8f0",
                          cardBorderRadius: 12,
                          showCardShadow: true,
                          photoHeightRatio: 78,
                          codeWidthRatio: 40,
                          cardPadding: 12,
                          fontFamily: "Outfit, sans-serif",
                        })
                      }
                      className="px-3 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Modern Dark
                    </button>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          primaryColor: "#0056b3",
                          cardBorderColor: "#000000",
                          cardBorderRadius: 4,
                          showCardShadow: false,
                          photoHeightRatio: 72,
                          codeWidthRatio: 30,
                          cardPadding: 4,
                          fontFamily: "Inter, sans-serif",
                        })
                      }
                      className="px-3 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Classic Blue
                    </button>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          primaryColor: "#64748b",
                          cardBorderColor: "#cbd5e1",
                          cardBorderRadius: 20,
                          showCardShadow: false,
                          photoHeightRatio: 82,
                          codeWidthRatio: 25,
                          cardPadding: 16,
                          fontFamily: "Space Grotesk, sans-serif",
                        })
                      }
                      className="px-3 py-4 bg-gray-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Minimalist
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Proporções do Card
                    <InfoTooltip text="Ajuste fino da estrutura interna de cada produto." />
                  </h4>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center">
                          Altura da Foto vs Texto
                          <InfoTooltip text="Define o percentual de altura que a imagem ocupa dentro do card." />
                        </label>
                        <span className="text-xs font-black text-blue-600">
                          {settings.photoHeightRatio}% /{" "}
                          {100 - settings.photoHeightRatio}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        className="w-full accent-blue-600"
                        value={settings.photoHeightRatio}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            photoHeightRatio: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center">
                          Largura do ID vs Descrição
                          <InfoTooltip text="Controle lateral da faixa de informações do produto." />
                        </label>
                        <span className="text-xs font-black text-blue-600">
                          {settings.codeWidthRatio}% /{" "}
                          {100 - settings.codeWidthRatio}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        className="w-full accent-blue-600"
                        value={settings.codeWidthRatio}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            codeWidthRatio: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Bordas e Espaçamento
                    <InfoTooltip text="Controle do 'ar' e das formas dos elementos no layout geral." />
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500">
                        Arredondamento
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        className="w-full accent-blue-600"
                        value={settings.cardBorderRadius}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cardBorderRadius: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500">
                        Padding Foto
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        className="w-full accent-blue-600"
                        value={settings.cardPadding}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cardPadding: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500">
                        Espaçamento Grid
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        className="w-full accent-blue-600"
                        value={settings.gridGap}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            gridGap: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500">
                        Margem Página (mm)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        className="w-full accent-blue-600"
                        value={settings.pageMargin}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pageMargin: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Estilização Final
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">
                        Cor Principal
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-full h-10 border-none bg-transparent cursor-pointer rounded-xl overflow-hidden"
                          value={settings.primaryColor}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              primaryColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">
                        Cor da Borda
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-full h-10 border-none bg-transparent cursor-pointer rounded-xl overflow-hidden"
                          value={settings.cardBorderColor}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              cardBorderColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-lg text-blue-600"
                      checked={settings.showCardShadow}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          showCardShadow: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                      Ativar Sombra (Soft Shadow)
                    </span>
                  </label>
                </section>
              </div>

              {/* Preview */}
              <div className="w-full md:w-80 mt-8 md:mt-0 flex flex-col items-center">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 transition-all">
                  Prévia Instantânea (V4)
                </h4>
                <div className="w-full aspect-[3/4] shadow-2xl rounded-2xl overflow-hidden ring-4 ring-blue-50 bg-white transition-all transform scale-100 hover:scale-[1.02]">
                  <ProductCard
                    product={{
                      id: "demo",
                      code: "2024",
                      description:
                        "EXEMPLO DE DESCRIÇÃO DO PRODUTO PARA TESTE DE LAYOUT DINÂMICO E VISUALIZAÇÃO EM TEMPO REAL",
                      category: "Demo",
                      image: null,
                    }}
                    settings={settings}
                  />
                </div>
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2 w-full">
                  <p className="text-[10px] font-bold text-gray-500 uppercase text-center leading-relaxed">
                    Layout: {settings.gridCols}x{settings.gridRows} no formato
                    A4
                    <br />
                    <span className="text-blue-600">
                      Font:{" "}
                      {fonts.find((f) => f.value === settings.fontFamily)?.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CatalogVisualizer = ({
  products,
  settings,
}: {
  products: Product[];
  settings: AppSettings;
}) => {
  const validProducts = (products || []).filter(
    (p) => p && p.id && !p.id.startsWith("temp-"),
  );
  const itemsPerPage = Math.max(
    1,
    (settings.gridCols || 1) * (settings.gridRows || 1),
  );
  const totalPages = Math.ceil(validProducts.length / itemsPerPage) || 1;
  const pages = [];

  if (validProducts.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < validProducts.length; i += itemsPerPage) {
      pages.push(validProducts.slice(i, i + itemsPerPage));
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="print-container space-y-12 no-print">
        {pages.map((p, i) => (
          <CatalogPage
            key={i}
            pageProducts={p}
            pageIndex={i}
            totalPages={totalPages}
            settings={settings}
          />
        ))}
      </div>

      {/* Absolute Hidden for Print only render */}
      <div className="print-only">
        {pages.map((p, i) => (
          <CatalogPage
            key={`print-${i}`}
            pageProducts={p}
            pageIndex={i}
            totalPages={totalPages}
            settings={settings}
          />
        ))}
      </div>
    </div>
  );
};

const ExportDialog = ({
  onClose,
  onJpg,
  onPdf,
  total,
  isExporting,
}: {
  onClose: () => void;
  onJpg: (selectedIdx: number[]) => void;
  onPdf: (selectedIdx: number[]) => void;
  total: number;
  isExporting: boolean;
}) => {
  const [selected, setSelected] = useState<number[]>(
    Array.from({ length: total }, (_, i) => i),
  );
  const [mode, setMode] = useState<"jpg" | "pdf">("pdf");

  const toggle = (i: number) => {
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  const selectAll = () =>
    setSelected(Array.from({ length: total }, (_, i) => i));
  const deselectAll = () => setSelected([]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 no-print"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Finalizar Exportação
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Escolha o formato e as páginas desejadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setMode("jpg")}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${mode === "jpg" ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            <Images size={18} /> Imagens (ZIP)
          </button>
          <button
            onClick={() => setMode("pdf")}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${mode === "pdf" ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            <FileText size={18} /> Documento PDF
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Selecionar Páginas ({selected.length}/{total})
              </h4>
              <div className="flex gap-4">
                <button
                  onClick={selectAll}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Todas
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Nenhuma
                </button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-2xl">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className={`
                       aspect-square rounded-xl text-sm font-black transition-all flex items-center justify-center
                       ${selected.includes(i) ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-100" : "bg-white text-gray-400 border border-gray-200 hover:border-blue-300"}
                     `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {mode === "pdf" && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                <FileDown className="text-blue-600 shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-blue-900 uppercase">
                    Exportação de Alta Fidelidade (PDF)
                  </h4>
                  <p className="text-[9px] font-medium text-blue-800/70 leading-tight">
                    Todas as fontes, cores e layouts serão incorporados no
                    arquivo final.
                    <br />
                    Processando em alta resolução (300 DPI).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 font-sans">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          {mode === "jpg" ? (
            <button
              onClick={() => onJpg(selected.sort((a, b) => a - b))}
              disabled={selected.length === 0 || isExporting}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              Baixar Imagens
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  onClose();
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                title="Usar motor de impressão do navegador"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={() => onPdf(selected.sort((a, b) => a - b))}
                disabled={selected.length === 0 || isExporting}
                className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all font-sans"
              >
                {isExporting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <FileDown size={18} />
                )}
                Exportar PDF Final
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- App Shell ---

function AppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [profiles, setProfiles] = useState<LayoutProfile[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const location = useLocation();

  // Lifecycle
  useEffect(() => {
    const savedP = localStorage.getItem("catalog_v4_products");
    const savedS = localStorage.getItem("catalog_v4_settings");
    const savedProfiles = localStorage.getItem("catalog_v4_profiles");

    if (savedP) {
      try {
        const parsed = JSON.parse(savedP);
        if (Array.isArray(parsed)) {
          // Filter out any potential corrupt data or unsaved temp items from older versions
          setProducts(
            parsed.filter((p) => p && p.id && !p.id.startsWith("temp-")),
          );
        } else {
          setProducts(initialProducts);
        }
      } catch (e) {
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }

    if (savedS) {
      try {
        const parsed = JSON.parse(savedS);
        if (parsed && typeof parsed === "object") {
          setSettings({ ...defaultSettings, ...parsed });
        } else {
          setSettings(defaultSettings);
        }
      } catch (e) {
        setSettings(defaultSettings);
      }
    }

    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed)) {
          setProfiles(parsed);
        } else {
          setProfiles([]);
        }
      } catch (e) {
        setProfiles([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("catalog_v4_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("catalog_v4_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("catalog_v4_profiles", JSON.stringify(profiles));
  }, [profiles]);

  const handleJpgExport = async (pages: number[]) => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      for (const idx of pages) {
        const el = document.getElementById(`catalog-page-${idx}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", 0.9),
        );
        if (blob) {
          zip.file(`pagina-${(idx + 1).toString().padStart(2, "0")}.jpg`, blob);
        }
      }
      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(
        archive,
        `catalogo-v4-${new Date().toISOString().split("T")[0]}.zip`,
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao exportar imagens.");
    } finally {
      setIsExporting(false);
      setShowExport(false);
    }
  };

  const handlePdfExport = async (pages: number[]) => {
    setIsExporting(true);
    try {
      // Ensure fonts are loaded before starting PDF generation
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        const idx = pages[i];
        const el = document.getElementById(`catalog-page-${idx}`);
        if (!el) {
          console.warn(`Página ${idx} não encontrada no DOM.`);
          continue;
        }

        // Prepare for high-quality capture
        const canvas = await html2canvas(el, {
          scale: 3, // Premium quality for sharp text
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: el.offsetWidth,
          windowHeight: el.offsetHeight,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById(`catalog-page-${idx}`);
            if (clonedEl) {
              clonedEl.style.transform = "none";
              clonedEl.style.boxShadow = "none";
            }
          },
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) pdf.addPage();
        
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "SLOW");
      }

      pdf.save(
        `catalogo-final-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (e) {
      console.error("Erro na exportação do PDF:", e);
      alert(
        `Erro ao exportar PDF: ${e instanceof Error ? e.message : "Erro desconhecido"}`
      );
    } finally {
      setIsExporting(false);
      setShowExport(false);
    }
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/products":
        return "Gerenciamento de Inventário";
      case "/visualizer":
        return "Prévia do Catálogo A4";
      case "/settings":
        return "Configurações Globais";
      default:
        return "Início";
    }
  };

  const itemsPerPage = settings.gridCols * settings.gridRows;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden select-none font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col no-print shrink-0 relative z-50">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Grid3x3 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">
                CATÁLOGO
              </h1>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Versão 4.0
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`
            }
          >
            <Package size={20} /> Estoque de Peças
          </NavLink>
          <NavLink
            to="/visualizer"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`
            }
          >
            <Eye size={20} /> Visualizar Catálogo
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`
            }
          >
            <Settings size={20} /> Layout & Cores
          </NavLink>
        </nav>

        <div className="p-8 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Suporte Técnico
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Sincronizado na Nuvem
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 flex items-center justify-between no-print shrink-0 relative z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {getTitle()}
            </h2>
            {isExporting && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                <Loader2 className="animate-spin" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Processando Exportação...
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {location.pathname === "/visualizer" && (
              <button
                onClick={() => setShowExport(true)}
                disabled={products.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-3 transition-all shadow-xl shadow-slate-100 active:scale-95"
              >
                <Download size={18} /> Exportar Versão Final
              </button>
            )}
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4 ml-4">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900 leading-none">
                  Admin Boto
                </p>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Super Usuário
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <Package size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route
                path="/products"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 p-8 flex flex-col"
                  >
                    <ProductManager
                      products={products}
                      setProducts={setProducts}
                      settings={settings}
                    />
                  </motion.div>
                }
              />
              <Route
                path="/visualizer"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 p-8 overflow-y-auto"
                  >
                    <CatalogVisualizer
                      products={products}
                      settings={settings}
                    />
                  </motion.div>
                }
              />
              <Route
                path="/settings"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 p-8 overflow-y-auto"
                  >
                    <SettingsManager
                      settings={settings}
                      setSettings={setSettings}
                      profiles={profiles}
                      setProfiles={setProfiles}
                    />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showExport && (
          <ExportDialog
            total={totalPages}
            onClose={() => setShowExport(false)}
            onJpg={handleJpgExport}
            onPdf={handlePdfExport}
            isExporting={isExporting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
