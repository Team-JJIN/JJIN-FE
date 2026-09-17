// Kakao Maps SDK(JS) 최소 타입 선언. 사용하는 API만 손으로 선언한다.
// https://apis.map.kakao.com/web/documentation/
declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
    draggable?: boolean;
    scrollwheel?: boolean;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getLevel(): number;
    panTo(latlng: LatLng): void;
    setBounds(
      bounds: LatLngBounds,
      paddingTop?: number,
      paddingRight?: number,
      paddingBottom?: number,
      paddingLeft?: number,
    ): void;
    relayout(): void;
  }

  interface CustomOverlayOptions {
    position: LatLng;
    content: HTMLElement | string;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
    map?: Map;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    setZIndex(zIndex: number): void;
  }

  interface PolylineOptions {
    path: LatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    map?: Map;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
    setPath(path: LatLng[]): void;
  }
}

interface Window {
  kakao?: { maps: typeof kakao.maps };
}
