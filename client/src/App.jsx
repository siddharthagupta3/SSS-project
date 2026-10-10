import { useEffect, useState } from "react";
import api from "./api/client";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/health")
      .then((res) => setHealth(res.data))
      .catch(() =>
        setError(
          "Could not reach the API. Start the server and check VITE_API_URL."
        )
      );
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="font-display text-2xl tracking-wide">SHOP.CO</span>
          <span className="text-sm text-neutral-300">MERN storefront</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
          Project setup complete
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          React (Vite) + Express are wired. Next steps: MongoDB connection, then
          auth and products.
        </p>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">API health</h2>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          {health && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-100 p-4 text-sm">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
