export function buildTabs(projectId) {
  return [
    { key: "board", label: "Tablero", href: `/proyecto/${projectId}` },
    { key: "metrics", label: "Métricas", href: `/proyecto/${projectId}/metricas` },
    { key: "team", label: "Equipo y objetivos", href: `/proyecto/${projectId}/equipo` },
  ];
}
