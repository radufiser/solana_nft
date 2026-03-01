import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load keypair from ~/.config/solana/id.json (default Solana CLI location)
// Returns a web3.js Keypair object with publicKey and secretKey
const user = await getKeypairFromFile();

try {
    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
} catch (error) {
    console.log("Airdrop failed (you may already have sufficient balance):", error.message);
}

console.log("Loaded user:", user.publicKey.toBase58());

// Create Umi instance - a modular framework for Solana/Metaplex development
// Configured with the devnet RPC endpoint (https://api.devnet.solana.com)
const umi = createUmi(connection.rpcEndpoint);

// Load the Token Metadata plugin - adds NFT functionality (createNft, fetchDigitalAsset)
// Without this, Umi doesn't know how to interact with Metaplex's Token Metadata program
umi.use(mplTokenMetadata())

// Convert web3.js keypair to Umi's internal keypair format
// Umi and web3.js use different keypair structures, so we need to translate
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// Set the identity - tells Umi which wallet will sign transactions
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user:", umiUser.publicKey);

// Generate a new keypair for the NFT collection's mint account
// This creates a unique address that will identify this collection on-chain
// This is NOT your wallet - it's the collection's permanent identifier
const collectionMint = generateSigner(umi);

// Create the NFT collection with metadata
// - mint: The unique address for this collection
// - name/symbol: Human-readable identifiers
// - uri: Points to off-chain JSON metadata (image, description, attributes)
// - sellerFeeBasisPoints: Royalty percentage (0 = 0%, 500 = 5%)
// - isCollection: true marks this as a collection that can contain other NFTs
const transaction = createNft(umi, {
    mint: collectionMint,
    name: "Radu's Collection",
    symbol: "RCOL",
    uri: "https://raw.githubusercontent.com/radufiser/solana_nft/main/sample-nft-collection-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

console.log("Creating NFT collection...");
console.log("Collection address:", collectionMint.publicKey);

// Send transaction to blockchain and wait for confirmation
// 'finalized' commitment means waiting for maximum confirmation (most secure)
const result = await transaction.sendAndConfirm(umi, {
    send: { commitment: 'finalized' },
    confirm: { commitment: 'finalized' }
});

console.log("Transaction confirmed:", result.signature);

// Wait a moment for the account to be fully available
await new Promise(resolve => setTimeout(resolve, 2000));

// Fetch the created NFT data from the blockchain to verify it was created successfully
const collectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);

console.log(`Collection created for address: ${getExplorerLink("address", collectionNft.mint.publicKey, "devnet")}`);