// Excalidraw element types for canvas synchronization

export interface ExcalidrawElement extends Record<string, any> {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'freedraw' | 'arrow' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  points?: [number, number][];
  seed?: number;
  version?: number;
  versionNonce?: number;
  isDeleted?: boolean;
  groupIds?: string[];
  boundElements?: any[] | null;
  updated?: number;
  link?: string | null;
  locked?: boolean;
}

export interface ExcalidrawAppState {
  viewBackgroundColor: string;
  currentItemFontFamily?: number;
  currentItemRoughness?: number;
  currentItemStrokeWidth?: number;
}
