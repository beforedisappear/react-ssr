type Theme = "light" | "dark";

const initialTheme = "light";

export function ThemeSwitcher() {
  const toggle = () => {
    const theme = (localStorage.getItem("theme") as Theme) || initialTheme;

    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.documentElement.dataset.theme = newTheme;
  };

  return <button onClick={toggle}>Toggle Theme</button>;
}
