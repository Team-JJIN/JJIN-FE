/**
 * @component PlanMap
 * Kakao 지도(마커·동선·bounds). 마커 탭은 카드 탭과 같은 의미로 onToggleOrder를 호출해
 * selected를 토글하고, 선택된 좌표를 지도 중심으로 부드럽게 이동시킨다. 마커 노드는
 * 장소 구성이 바뀔 때만 새로 만들고 선택 상태는 살아 있는 노드의 클래스만 갱신한다 —
 * 색 전환과 포커스를 보존하기 위해서다. status가 "ready"가 아니면(로딩·에러·키 없음)
 * 지도를 그리지 않고 bg-surface 회색 배경만 남는다 — 문구 없음.
 */
"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { sectionEnter } from "@/app/_components/motion/tokens";
import { useKakaoLoader } from "../../_hooks/useKakaoLoader";
import CourseDropdown from "./CourseDropdown";
import type { PlanPlace } from "../../_types";

interface PlanMapProps {
  places: PlanPlace[];
  selectedOrder: number | null;
  onSelectOrder: (n: number) => void;
  onToggleOrder: (order: number) => void;
  showDropdown: boolean;
}

const DEFAULT_CENTER = { lat: 37.4563, lng: 126.7052 }; // 인천시청
const DEFAULT_LEVEL = 5;
const SINGLE_PLACE_LEVEL = 4;
/**
 * setBounds가 이보다 더 확대하면 되돌린다. mock처럼 장소들이 수십 m 안에 몰려 있으면
 * 축척 30m까지 확대돼 건물 도면만 남고 주변 맥락·라벨이 사라진다(저화질처럼 보이는 원인).
 */
const MIN_FIT_LEVEL = 4;

const MARKER_BASE =
  "pointer-events-auto flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[12px] font-semibold leading-none shadow-[0_2px_6px_rgba(23,23,23,0.16)] transition-colors duration-150";
const MARKER_DEFAULT = "bg-dark text-white";
const MARKER_SELECTED = "bg-lime-vivid text-dark";

/** 살아 있는 마커 노드에 선택 상태만 반영한다(노드를 교체하지 않는다). */
function applyMarkerState(el: HTMLButtonElement, isSelected: boolean) {
  el.className = `${MARKER_BASE} ${isSelected ? MARKER_SELECTED : MARKER_DEFAULT}`;
  el.setAttribute("aria-pressed", String(isSelected));
}

export default function PlanMap({
  places,
  selectedOrder,
  onSelectOrder,
  onToggleOrder,
  showDropdown,
}: PlanMapProps) {
  const t = useTranslations("plan");
  const status = useKakaoLoader();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const markerElsRef = useRef<HTMLButtonElement[]>([]);
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);

  const onToggleOrderRef = useRef(onToggleOrder);
  const selectedOrderRef = useRef(selectedOrder);
  const tRef = useRef(t);

  const placesKey = places.map((p) => `${p.id}:${p.lat},${p.lng}`).join("|");

  // 렌더 단계에서 ref를 변형하지 않도록 커밋 후에 동기화한다. 아래 효과들보다 먼저
  // 선언해야 같은 커밋에서 최신 값을 읽는다(효과는 선언 순서대로 실행된다).
  useEffect(() => {
    onToggleOrderRef.current = onToggleOrder;
    selectedOrderRef.current = selectedOrder;
    tRef.current = t;
  });

  // 효과 (a): 지도 인스턴스 생성. StrictMode 이중 마운트에서도 언마운트 시 컨테이너를
  // 비워(replaceChildren) 이전 인스턴스의 DOM 잔재를 남기지 않는다 — destroy API가 없다.
  useEffect(() => {
    const el = containerRef.current;
    if (status !== "ready" || !el || !window.kakao) return;

    const map = new window.kakao.maps.Map(el, {
      center: new window.kakao.maps.LatLng(
        DEFAULT_CENTER.lat,
        DEFAULT_CENTER.lng,
      ),
      level: DEFAULT_LEVEL,
    });
    map.relayout();
    mapRef.current = map;

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
      markerElsRef.current = [];
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      mapRef.current = null;
      el.replaceChildren();
    };
  }, [status]);

  // 효과 (b): 마커·동선 생성. 장소 구성(placesKey)이 바뀔 때만 돈다. 선택 상태는
  // 여기서 초기값만 반영하고 이후 갱신은 효과 (b2)가 맡는다.
  useEffect(() => {
    const map = mapRef.current;
    const kakaoMaps = window.kakao?.maps;
    if (!map || !kakaoMaps) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    markerElsRef.current = [];
    polylineRef.current?.setMap(null);
    polylineRef.current = null;

    const selected = selectedOrderRef.current;

    places.forEach((place) => {
      const isSelected = place.order === selected;
      const content = document.createElement("button");
      content.type = "button";
      content.dataset.order = String(place.order);
      content.setAttribute(
        "aria-label",
        tRef.current("markerLabel", { n: place.order, name: place.name }),
      );
      content.textContent = String(place.order);
      applyMarkerState(content, isSelected);
      content.addEventListener("click", () =>
        onToggleOrderRef.current(place.order),
      );

      const overlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(place.lat, place.lng),
        content,
        // 둥근 번호 배지라 좌표를 배지 중심에 둔다 — 바닥(1)에 걸면 동선 끝이 배지 아래로 삐져나온다.
        yAnchor: 0.5,
        zIndex: isSelected ? 2 : 1,
        clickable: true,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
      markerElsRef.current.push(content);
    });

    const sorted = [...places].sort((a, b) => a.order - b.order);
    if (sorted.length >= 2) {
      const path = sorted.map((p) => new kakaoMaps.LatLng(p.lat, p.lng));
      const polyline = new kakaoMaps.Polyline({
        path,
        strokeWeight: 3,
        strokeColor: "#171717",
        strokeOpacity: 0.85,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }
    // placesKey만으로 재생성 시점을 결정한다 — places 참조 변화(구성 불변)는 무시.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey, status]);

  // 효과 (b2): 선택 상태만 반영. 노드를 교체하지 않으므로 transition-colors가 실제로
  // 동작하고, 키보드로 마커를 눌러도 포커스가 유지된다.
  useEffect(() => {
    markerElsRef.current.forEach((el, i) => {
      const isSelected = Number(el.dataset.order) === selectedOrder;
      applyMarkerState(el, isSelected);
      overlaysRef.current[i]?.setZIndex(isSelected ? 2 : 1);
    });
  }, [selectedOrder]);

  // 효과 (c): 중심·zoom 재조정. selectedOrder 변경으로는 다시 맞추지 않는다 —
  // placesKey(순서·구성)가 바뀔 때만 돈다.
  useEffect(() => {
    const map = mapRef.current;
    const kakaoMaps = window.kakao?.maps;
    if (!map || !kakaoMaps) return;

    if (places.length === 0) {
      map.setCenter(
        new kakaoMaps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      );
      map.setLevel(DEFAULT_LEVEL);
    } else if (places.length === 1) {
      map.setCenter(new kakaoMaps.LatLng(places[0].lat, places[0].lng));
      map.setLevel(SINGLE_PLACE_LEVEL);
    } else {
      const bounds = new kakaoMaps.LatLngBounds();
      places.forEach((p) => bounds.extend(new kakaoMaps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds, 32, 32, 32, 32);
      if (map.getLevel() < MIN_FIT_LEVEL) map.setLevel(MIN_FIT_LEVEL);
    }
    // placesKey만으로 재조정 시점을 결정한다 — places 참조 변화(순서·구성 불변)는 무시.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey, status]);

  // 효과 (d): 선택한 장소를 지도 중심으로. zoom은 건드리지 않는다. 해제(null)일 때는
  // 이동하지 않아 사용자가 보던 위치가 유지된다.
  useEffect(() => {
    const map = mapRef.current;
    const kakaoMaps = window.kakao?.maps;
    if (!map || !kakaoMaps || selectedOrder === null) return;

    const place = places.find((p) => p.order === selectedOrder);
    if (!place) return;

    const center = new kakaoMaps.LatLng(place.lat, place.lng);
    if (reduceMotion) map.setCenter(center);
    else map.panTo(center);
    // placesKey로 장소 구성 변화만 감지한다 — places 참조 변화는 무시.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder, placesKey, status, reduceMotion]);

  return (
    <motion.div
      {...sectionEnter(2, true)}
      className="relative h-[196px] w-full shrink-0 overflow-hidden rounded-2xl bg-surface"
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="group"
        aria-label={t("mapLabel")}
      />
      {showDropdown && (
        <CourseDropdown
          count={places.length}
          selectedOrder={selectedOrder}
          onSelect={onSelectOrder}
        />
      )}
    </motion.div>
  );
}
