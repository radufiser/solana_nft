import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// =============================================================================
// STEP 1: CONNECT TO SOLANA DEVNET
// =============================================================================
// Creates a connection to Solana's devnet (free test network)
// - devnet = test network with free tokens (what we use for learning)
// - testnet = more stable test network
// - mainnet-beta = production network with real SOL (costs real money!)
//
// "confirmed" commitment level = wait for network confirmation before proceeding
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// =============================================================================
// STEP 2: LOAD YOUR WALLET
// =============================================================================
// Loads your Solana keypair from ~/.config/solana/id.json
// This is the DEFAULT location created by: solana-keygen new
//
// IMPORTANT: This is YOUR wallet that will:
// - Pay transaction fees (small amount of SOL)
// - Sign the transaction to authorize it
// - Receive/own the collection NFT token
//
// NOT TO BE CONFUSED WITH: The mint account (created later in STEP 5)
const user = await getKeypairFromFile();

// =============================================================================
// STEP 3: REQUEST DEVNET SOL (FREE TEST TOKENS)
// =============================================================================
// Checks if wallet has at least 0.5 SOL. If not, requests 1 SOL airdrop.
// 
// DEVNET ONLY: This gives you free test SOL for development
// - Devnet SOL has NO real-world value
// - Rate limited: ~5 SOL per hour per IP address
// - Alternative: https://faucet.solana.com if this fails
//
// ON MAINNET: Remove this! Airdrops don't exist. You must purchase SOL.
//
// COMMON MISTAKE: Trying to airdrop on mainnet will fail
try {
    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
} catch (error) {
    console.log("Airdrop failed (you may already have sufficient balance):", error.message);
}

console.log("Loaded user:", user.publicKey.toBase58());

// =============================================================================
// STEP 4: INITIALIZE UMI FRAMEWORK
// =============================================================================
// Umi is Metaplex's modern framework for building Solana apps
// Think of it as a "toolbox" that provides pre-built functions for NFTs
//
// WHY UMI?
// - Simplifies complex Token Metadata interactions
// - Plugin-based: Add features as you need them
// - Type-safe: Catches errors before runtime
// - Maintained by Metaplex: Always up-to-date with standards
//
// This creates the Umi instance configured for devnet
const umi = createUmi(connection.rpcEndpoint);

// Load the Token Metadata plugin
// WITHOUT THIS: Umi doesn't know how to create NFTs
// WITH THIS: Umi gains functions like createNft(), fetchDigitalAsset(), etc.
//
// The Token Metadata Program is a smart contract on Solana that stores NFT data
// This plugin teaches Umi how to interact with that program
umi.use(mplTokenMetadata())

// Convert web3.js keypair format to Umi's internal format
// WHY NEEDED: web3.js and Umi use different keypair structures internally
// - web3.js: Uses Keypair class from @solana/web3.js
// - Umi: Uses its own keypair format for consistency across Metaplex tools
//
// user.secretKey contains both public and private key (64 bytes total)
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// Tell Umi which wallet will sign transactions
// This sets the "identity" - the wallet that authorizes all operations
// 
// WHAT THIS DOES:
// - All transactions will be signed by this wallet
// - Transaction fees will be paid from this wallet
// - This wallet becomes the "update authority" for the collection
//   (meaning it can modify collection metadata later)
//
// SECURITY NOTE: Never share this private key. On mainnet, use hardware wallets.
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user:", umiUser.publicKey);


const collectionAddress = publicKey("FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R");

console.log("Creating NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: mint,
    name: "Radu's First NFT",
    symbol: "RFT",
    uri: "https://raw.githubusercontent.com/radufiser/solana_nft/main/sample-nft-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

const result = await transaction.sendAndConfirm(umi);

console.log("✅ NFT Created Successfully!");
console.log("   Mint Address:", mint.publicKey);
console.log("   Explorer Link:", getExplorerLink("address", mint.publicKey, "devnet"));

// Optional: Verify the NFT was created by fetching it
console.log("\nVerifying NFT creation...");
await new Promise(resolve => setTimeout(resolve, 5000));

try {
    const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
    console.log("✅ Verification successful! NFT name:", createdNft.metadata.name);
} catch (error) {
    console.log("⚠️  Verification fetch failed (this is OK - the NFT was created)");
    console.log("   The network may need more time to index. Check the explorer link above.");
}