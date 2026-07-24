import React, { useState } from 'react';

type User = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

type Props = {
  users: User[];
  onDelete?: (id: string) => void;
};

export const UserList: React.FC<Props> = ({ users = [], onDelete }) => {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  return (
    <div aria-label="user-list">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} data-testid={`user-${u.id}`}>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.email ?? '-'}</td>
              <td style={{ padding: 8 }}>{u.role ?? 'user'}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                {pendingDelete === u.id ? (
                  <span>
                    <button data-testid={`confirm-${u.id}`} onClick={() => { onDelete?.(u.id); setPendingDelete(null); }} aria-label={`Confirm delete ${u.name}`}>
                      Confirm
                    </button>
                    <button data-testid={`cancel-${u.id}`} onClick={() => setPendingDelete(null)} aria-label={`Cancel delete ${u.name}`} style={{ marginLeft: 8 }}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button data-testid={`delete-${u.id}`} onClick={() => setPendingDelete(u.id)} aria-label={`Delete ${u.name}`}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
