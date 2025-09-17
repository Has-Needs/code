import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { NextGraphMock } from 'has-needs-core-logic/src/nextgraph-mock';
import { Persona } from 'has-needs-core-logic/src/data-models';

const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [personaName, setPersonaName] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    // Simulate NextGraph initialization
    setInitialized(true);
    // Load existing personas from mock repository
    const repo = NextGraphMock.getRepository('unified-personal-chain');
    setPersonas(repo.query<Persona>({ typename: 'Persona' }));
  }, []);

  const handleCreatePersona = () => {
    if (personaName) {
      const newIdentity = NextGraphMock.Identity.create();
      const repo = NextGraphMock.getRepository('unified-personal-chain');
      const newPersona = repo.commit({
        id: newIdentity.publicKey, // Using publicKey as ID for simplicity
        name: personaName,
        publicKey: newIdentity.publicKey,
        typename: 'Persona', // Add typename for filtering
      }) as Persona;
      setPersonas(prev => [...prev, newPersona]);
      setCurrentPersona(newPersona);
      setPersonaName('');
    }
  };

  if (!initialized) {
    return <div>Initializing Has-Needs...</div>;
  }

  return (
    <div>
      <h1>Welcome to Has-Needs!</h1>
      {currentPersona ? (
        <div>
          <p>Active Persona: {currentPersona.name} ({currentPersona.publicKey})</p>
          {/* Further UI for Has/Needs will go here */}
        </div>
      ) : (
        <div>
          <h2>Create or Select Persona</h2>
          <input
            type="text"
            placeholder="New Persona Name"
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
          />
          <button onClick={handleCreatePersona}>Create Persona</button>
          <h3>Existing Personas</h3>
          <ul>
            {personas.map((p) => (
              <li key={p.id} onClick={() => setCurrentPersona(p)}>
                {p.name} ({p.publicKey})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);