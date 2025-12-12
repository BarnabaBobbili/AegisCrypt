"""
Integrity Service - Merkle Tree Implementation

Provides cryptographic integrity verification using Merkle trees.
Enables zero-knowledge proofs for chunk-based file integrity.
"""

import hashlib
from typing import List, Optional, Tuple, Dict, Any
from dataclasses import dataclass
from math import ceil, log2


@dataclass
class MerkleProof:
    """Proof for a specific chunk in the Merkle tree."""
    chunk_index: int
    chunk_hash: str
    sibling_hashes: List[Tuple[str, str]]  # (hash, position: 'left' or 'right')
    root_hash: str


class MerkleTree:
    """
    Merkle Tree implementation for file integrity verification.
    
    Divides file into chunks and builds a binary hash tree where:
    - Leaves are hashes of file chunks
    - Internal nodes are hashes of their children
    - Root is a single hash representing the entire file
    
    This enables:
    - Efficient integrity verification
    - Zero-knowledge proofs (verify chunk without revealing others)
    - Tamper detection with minimal overhead
    """
    
    def __init__(self, data: bytes, chunk_size: int = 4096):
        """
        Initialize Merkle tree from data.
        
        Args:
            data: Raw file content
            chunk_size: Size of each chunk in bytes (default 4KB)
        """
        self.data = data
        self.chunk_size = chunk_size
        self.chunks = self._split_into_chunks(data, chunk_size)
        self.tree = self._build_tree()
        self.root = self.tree[0] if self.tree else ""
    
    def _split_into_chunks(self, data: bytes, chunk_size: int) -> List[bytes]:
        """Split data into fixed-size chunks."""
        chunks = []
        for i in range(0, len(data), chunk_size):
            chunks.append(data[i:i + chunk_size])
        return chunks
    
    def _hash(self, data: bytes) -> str:
        """Compute SHA-256 hash of data."""
        return hashlib.sha256(data).hexdigest()
    
    def _hash_pair(self, left: str, right: str) -> str:
        """Hash a pair of hashes together."""
        combined = left + right
        return hashlib.sha256(combined.encode('utf-8')).hexdigest()
    
    def _build_tree(self) -> List[str]:
        """
        Build Merkle tree bottom-up.
        
        Returns:
            List where tree[0] is root, tree[1:] are internal nodes and leaves
        """
        if not self.chunks:
            return []
        
        # Level 0: Hash all chunks (leaf nodes)
        current_level = [self._hash(chunk) for chunk in self.chunks]
        tree_levels = [current_level.copy()]
        
        # Build tree upward until we have a single root
        while len(current_level) > 1:
            next_level = []
            
            # Process pairs
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    # Hash pair
                    parent = self._hash_pair(current_level[i], current_level[i + 1])
                else:
                    # Odd node - duplicate it (standard Merkle tree approach)
                    parent = self._hash_pair(current_level[i], current_level[i])
                
                next_level.append(parent)
            
            tree_levels.append(next_level.copy())
            current_level = next_level
        
        # Flatten tree into single list (root at index 0)
        all_hashes = []
        for level in reversed(tree_levels):  # Root first
            all_hashes.extend(level)
        
        return all_hashes
    
    def get_root(self) -> str:
        """Get Merkle root hash."""
        return self.root
    
    def generate_proof(self, chunk_index: int) -> MerkleProof:
        """
        Generate Merkle proof for a specific chunk.
        
        Args:
            chunk_index: Index of the chunk to prove
            
        Returns:
            MerkleProof containing the path to the root
            
        Raises:
            ValueError: If chunk_index is invalid
        """
        if chunk_index < 0 or chunk_index >= len(self.chunks):
            raise ValueError(f"Invalid chunk index: {chunk_index}")
        
        # Get chunk hash
        chunk_hash = self._hash(self.chunks[chunk_index])
        
        # Build sibling path
        sibling_hashes = []
        current_level = [self._hash(chunk) for chunk in self.chunks]
        current_index = chunk_index
        
        while len(current_level) > 1:
            # Find sibling
            if current_index % 2 == 0:
                # Current is left child
                if current_index + 1 < len(current_level):
                    sibling = current_level[current_index + 1]
                    position = 'right'
                else:
                    # No sibling (odd number of nodes)
                    sibling = current_level[current_index]
                    position = 'right'
            else:
                # Current is right child
                sibling = current_level[current_index - 1]
                position = 'left'
            
            sibling_hashes.append((sibling, position))
            
            # Move to parent level
            next_level = []
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    parent = self._hash_pair(current_level[i], current_level[i + 1])
                else:
                    parent = self._hash_pair(current_level[i], current_level[i])
                next_level.append(parent)
            
            current_level = next_level
            current_index = current_index // 2
        
        return MerkleProof(
            chunk_index=chunk_index,
            chunk_hash=chunk_hash,
            sibling_hashes=sibling_hashes,
            root_hash=self.root
        )
    
    @staticmethod
    def verify_proof(proof: MerkleProof, chunk_data: bytes) -> bool:
        """
        Verify a Merkle proof without full tree.
        
        Args:
            proof: Merkle proof to verify
            chunk_data: Actual chunk data
            
        Returns:
            True if proof is valid
        """
        # Hash the chunk
        chunk_hash = hashlib.sha256(chunk_data).hexdigest()
        
        # Verify chunk hash matches proof
        if chunk_hash != proof.chunk_hash:
            return False
        
        # Rebuild path to root
        current_hash = chunk_hash
        for sibling_hash, position in proof.sibling_hashes:
            if position == 'left':
                # Sibling is on the left
                current_hash = hashlib.sha256(
                    (sibling_hash + current_hash).encode('utf-8')
                ).hexdigest()
            else:
                # Sibling is on the right
                current_hash = hashlib.sha256(
                    (current_hash + sibling_hash).encode('utf-8')
                ).hexdigest()
        
        # Check if we reached the correct root
        return current_hash == proof.root_hash
    
    def get_tree_info(self) -> Dict[str, Any]:
        """Get information about the tree structure."""
        num_chunks = len(self.chunks)
        tree_height = ceil(log2(num_chunks)) if num_chunks > 0 else 0
        
        return {
            "num_chunks": num_chunks,
            "chunk_size": self.chunk_size,
            "tree_height": tree_height,
            "root_hash": self.root,
            "total_size": len(self.data)
        }


class IntegrityService:
    """
    Service for managing file integrity using Merkle trees.
    
    Provides high-level operations for:
    - Creating Merkle trees from file content
    - Storing Merkle roots
    - Verifying file integrity
    - Generating and verifying proofs
    """
    
    DEFAULT_CHUNK_SIZE = 4096  # 4KB chunks
    
    @staticmethod
    def create_merkle_tree(content: bytes, chunk_size: Optional[int] = None) -> MerkleTree:
        """
        Create a Merkle tree from file content.
        
        Args:
            content: File content as bytes
            chunk_size: Optional custom chunk size
            
        Returns:
            MerkleTree instance
        """
        chunk_size = chunk_size or IntegrityService.DEFAULT_CHUNK_SIZE
        return MerkleTree(content, chunk_size)
    
    @staticmethod
    def verify_integrity(content: bytes, expected_root: str, chunk_size: int) -> bool:
        """
        Verify file integrity against expected Merkle root.
        
        Args:
            content: File content to verify
            expected_root: Expected Merkle root hash
            chunk_size: Chunk size used in original tree
            
        Returns:
            True if integrity is verified
        """
        tree = MerkleTree(content, chunk_size)
        return tree.get_root() == expected_root
    
    @staticmethod
    def verify_chunk_proof(chunk_data: bytes, proof_data: Dict[str, Any]) -> bool:
        """
        Verify a chunk using its Merkle proof.
        
        Args:
            chunk_data: The chunk to verify
            proof_data: Proof data dictionary
            
        Returns:
            True if proof is valid
        """
        proof = MerkleProof(
            chunk_index=proof_data['chunk_index'],
            chunk_hash=proof_data['chunk_hash'],
            sibling_hashes=[(h, p) for h, p in proof_data['sibling_hashes']],
            root_hash=proof_data['root_hash']
        )
        
        return MerkleTree.verify_proof(proof, chunk_data)
