/// <reference types="vite/client" />

declare module 'lucide-react' {
  export const Activity: any;
  export const AlertTriangle: any;
  export const ArrowRight: any;
  export const Bell: any;
  export const Box: any;
  export const Building2: any;
  export const CheckCircle2: any;
  export const ChevronDown: any;
  export const CircleDot: any;
  export const ClipboardCheck: any;
  export const Compass: any;
  export const FileText: any;
  export const Filter: any;
  export const Gauge: any;
  export const Globe2: any;
  export const Grid2X2: any;
  export const Layers3: any;
  export const LocateFixed: any;
  export const Map: any;
  export const MapPin: any;
  export const Menu: any;
  export const Minus: any;
  export const Moon: any;
  export const Plus: any;
  export const RefreshCw: any;
  export const Ruler: any;
  export const Search: any;
  export const Settings2: any;
  export const ShieldCheck: any;
  export const Sparkles: any;
  export const Sun: any;
  export const UserRound: any;
  export const Users: any;
  export const X: any;
  export const Zap: any;
  export type LucideIcon = any;
  const icons: any;
  export default icons;
}

declare module '@xyflow/react' {
  export const ReactFlow: any;
  export const Background: any;
  export const Controls: any;
  export type Node<T = any> = any;
  export type Edge<T = any> = any;
  export type NodeProps<T = any> = any;
}

declare module 'maplibre-gl' {
  export const setWorkerUrl: (url: string) => void;
  export class Map {
    constructor(options: any);
    on(event: string, callback: (...args: any[]) => void): this;
    on(event: string, layer: string, callback: (...args: any[]) => void): this;
    once(event: string, callback: (...args: any[]) => void): this;
    remove(): void;
    resize(): void;
    isStyleLoaded(): boolean;
    getLayer(id: string): any;
    getSource(id: string): any;
    addSource(id: string, source: any): void;
    addLayer(layer: any, beforeId?: string): void;
    setLayoutProperty(layerId: string, name: string, value: any): void;
    setPaintProperty(layerId: string, name: string, value: any): void;
    fitBounds(bounds: any, options?: any): void;
    flyTo(options: any): void;
    zoomIn(options?: any): void;
    zoomOut(options?: any): void;
    getZoom(): number;
    getCanvas(): HTMLCanvasElement;
  }
  export class Popup {
    constructor(options?: any);
    setLngLat(lnglat: any): this;
    setDOMContent(content: HTMLElement): this;
    addTo(map: any): this;
    remove(): void;
  }
  export interface MapMouseEvent {
    lngLat: { lng: number; lat: number };
    point: { x: number; y: number };
    [key: string]: any;
  }
  export interface MapLayerMouseEvent extends MapMouseEvent {
    features?: any[];
  }
  export interface GeoJSONSource {
    setData(data: any): void;
  }
}

declare module 'maplibre-gl/dist/maplibre-gl.mjs' {
  export * from 'maplibre-gl';
}
