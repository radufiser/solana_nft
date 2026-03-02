import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const user = await getKeypairFromFile();

try {
    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
} catch (error) {
    console.log("Airdrop failed (you may already have sufficient balance):", error.message);
}

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata())
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));
console.log("Set up Umi instance for user:", umiUser.publicKey);


const collectionAddress = publicKey("FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R");
const nftAddress = publicKey("5UGsJV5pBPwRZmm68ZNHxUQQk6rNUGhDFeUEMzcircUi");

console.log("Verifying NFT...");

// NFT data is stored in 3 separate accounts:
// 1. Mint account (nftAddress) - the token itself
// 2. Metadata account - stores name, URI, collection info (what we're updating)
// 3. Token account - tracks ownership
//
// The metadata account address is a PDA (Program Derived Address) calculated
// deterministically from the mint address. We must find this PDA to update
// the verified flag in the metadata.
const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,

});

transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} verified! View on explorer: ${getExplorerLink("address", nftAddress, "devnet")}`);