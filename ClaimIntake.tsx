import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface ClaimResult {
  claimType: string;
  incidentDate: string | null;
  summary: string;
  priority: 'Low' | 'Medium' | 'High';
  riskScore: number;
}

export default function ClaimIntake() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/ai-claims/extract', {
        description,
      });
      setResult(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your claim..."
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Extract Claim'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}
