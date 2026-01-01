// Simple vehicle API wrapper using fetch
// Assumes a proxy or same origin for /api

export async function deleteVehicle(id) {
  const res = await fetch(`/api/vehicles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    let errorMsg = 'Failed to delete vehicle';
    try {
      const j = await res.json();
      errorMsg = j.message || errorMsg;
    } catch (e) {}
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}
