import React from 'react';

type Props = {
  title?: string;
  onRefresh?: () => void;
};

export const AdminPanel: React.FC<Props> = ({ title = 'Admin Panel', onRefresh }) => {
  return (
    <section aria-label="admin-panel" style={{ padding: 20, border: '1px solid #e6e6e6', borderRadius: 8 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div>
          <button onClick={onRefresh} aria-label="Refresh" style={{ marginRight: 8 }}>Refresh</button>
          <button aria-label="Create">Create</button>
        </div>
      </header>

      <div>
        <p style={{ margin: 0 }}>Overview: quick admin actions and metrics will appear here.</p>
      </div>
    </section>
  );
};

export default AdminPanel;
