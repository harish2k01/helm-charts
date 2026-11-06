try {
  const selected = localStorage.getItem("theme");
  if (selected === "light" || selected === "dark")
    document.documentElement.dataset.theme = selected;
} catch {
  /* Use the system appearance when storage is unavailable. */
}
