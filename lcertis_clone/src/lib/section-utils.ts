export function sectionPadding(embedded?: boolean) {
  return embedded ? "py-10 md:py-16" : "py-24 md:py-32";
}

export function sectionMinHeight(embedded?: boolean) {
  return embedded ? "min-h-[calc(100vh-9rem)]" : "";
}
