import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const connnection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = await getKeypairFromFile();

try {
    await airdropIfRequired(connnection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
} catch (error) {
    console.log("Airdrop failed (you may already have sufficient balance):", error.message);
}

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connnection.rpcEndpoint);

umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user:", umiUser.publicKey);

const collectionMint = generateSigner(umi);

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

const result = await transaction.sendAndConfirm(umi, {
    send: { commitment: 'finalized' },
    confirm: { commitment: 'finalized' }
});

console.log("Transaction confirmed:", result.signature);

// Wait a moment for the account to be fully available
await new Promise(resolve => setTimeout(resolve, 2000));

const collectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);

console.log(`Collection created for address: ${getExplorerLink("address", collectionNft.mint.publicKey, "devnet")}`);