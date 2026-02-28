import { List } from "../../features/list/list";

export function CounterPage() {
  return (
    <section>
      <h2>Отдельная страница счётчика</h2>
      <p>Здесь можно вынести свою логику/состояние.</p>
      <List />
    </section>
  );
}
