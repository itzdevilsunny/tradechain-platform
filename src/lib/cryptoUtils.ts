import { MerkleNode, MerkleProof, TradeRecord } from '../types/trading';

// Simple deterministic hash helper to generate 64-char hex string (SHA-256 simulated/real)
export function generateSHA256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + '8c7f91a92bc08912f4ca148803ef92e1a0b301c29e71f4b892a013d4fa44df2').slice(0, 64);
}

// Generate an interactive 3-tier Merkle Tree structure for Block #4281
export function createBlockMerkleTree(trades: TradeRecord[]): MerkleNode {
  const leaves: MerkleNode[] = [
    {
      id: 'leaf-1',
      label: 'TRD-00041',
      hash: trades[0]?.txHash?.slice(0, 16) || '8c7f91a92bc08912',
      type: 'leaf',
      tradeId: 'TRD-00041'
    },
    {
      id: 'leaf-2',
      label: 'TRD-00042',
      hash: '3d18e4bc0082f918',
      type: 'leaf',
      tradeId: 'TRD-00042'
    },
    {
      id: 'leaf-3',
      label: 'TRD-00043',
      hash: '55ef01a89c31bde1',
      type: 'leaf',
      tradeId: 'TRD-00043'
    },
    {
      id: 'leaf-4',
      label: 'TRD-00044',
      hash: '91f82c49b8c7f91a',
      type: 'leaf',
      tradeId: 'TRD-00044'
    }
  ];

  const parent1: MerkleNode = {
    id: 'node-h12',
    label: 'Node H(A)',
    hash: '0xc4b189a2e71f4b89',
    type: 'internal',
    children: [leaves[0], leaves[1]]
  };

  const parent2: MerkleNode = {
    id: 'node-h34',
    label: 'Node H(B)',
    hash: '0x71f92e3a89c01192',
    type: 'internal',
    children: [leaves[2], leaves[3]]
  };

  const root: MerkleNode = {
    id: 'merkle-root',
    label: 'MERKLE ROOT',
    hash: '0x9ab42ef71d5b128c704f1129bc4892c90a8e104192b719421de1994801ac',
    type: 'root',
    children: [parent1, parent2]
  };

  return root;
}

export function generateMerkleProof(tradeId: string): MerkleProof {
  return {
    tradeId,
    leafHash: '8c7f91a92bc08912f4ca148803ef92e1a0b301c29e71f4b892a013d4fa44df2',
    proof: [
      { hash: '3d18e4bc0082f918e7b99c01192e8471b049a8b', position: 'right' },
      { hash: '0x71f92e3a89c01192e8471b049a8b000f91e7c834', position: 'right' }
    ],
    root: '0x9ab42ef71d5b128c704f1129bc4892c90a8e104192b719421de1994801ac',
    isValid: true
  };
}

// Reliable cross-browser file download trigger using standard Blobs and Object URLs
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    try {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {}
  }, 300);
}
