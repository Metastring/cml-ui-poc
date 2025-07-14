
export function movePolygonLayersToTop(map) {
  ['td-polygon', 'td-polygon-outline'].forEach((id) => {
    if (map.getLayer(id)) {
      map.moveLayer(id);
    }
  });
}

export function patchMapAddLayer(map) {
  // Prevent patching more than once
  if (!map || map._patched) return;

  const originalAddLayer = map.addLayer.bind(map);
  map.addLayer = (...args) => {
    originalAddLayer(...args);
    movePolygonLayersToTop(map);
  };

  map._patched = true; // Mark as patched
}
