import { useQuery } from "@tanstack/react-query";

export type Client = {
  id: number;
  name: string;
  company: string;
};

const MOCK_DATA: Client[] = [
  { id: 1, name: "John Doe", company: "Acme Corp" },
  { id: 2, name: "Jane Smith", company: "Beta Ltd" },
  { id: 3, name: "Michael Brown", company: "Gamma Inc" },
];

function fetchClients(): Promise<Client[]> {
  return new Promise((resolve) => {
    console.log("fetchClients");
    setTimeout(() => {
      resolve(MOCK_DATA);
    }, 800); // имитация задержки
  });
}

export function List() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  if (isLoading) {
    return <p>Loading clients...</p>;
  }

  if (isError) {
    return <p>Error: {(error as Error).message}</p>;
  }

  return (
    <ul>
      {data!.map((client) => (
        <li key={client.id}>
          <strong>{client.name}</strong> — {client.company}
        </li>
      ))}
    </ul>
  );
}
