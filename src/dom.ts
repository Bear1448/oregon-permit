export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: Array<Node | string | null | undefined | false>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") {
      node.className = String(value);
    } else if (key === "dataset" && value && typeof value === "object") {
      for (const [dataKey, dataValue] of Object.entries(value as Record<string, string>)) {
        node.dataset[dataKey] = dataValue;
      }
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      node.addEventListener(eventName, value as EventListener);
    } else if (key === "text") {
      node.textContent = String(value);
    } else if (key in node && (typeof value === "boolean" || key === "tabIndex")) {
      (node as unknown as Record<string, unknown>)[key] = value;
    } else if (typeof value === "boolean") {
      if (value) node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (!child) continue;
    node.append(child);
  }
  return node;
}
