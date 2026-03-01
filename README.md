# Solana NFT Tutorial

A complete tutorial on creating NFTs on the Solana blockchain using Metaplex.

## What is an NFT?

An **NFT (Non-Fungible Token)** is a unique digital asset stored on a blockchain that represents ownership of a specific item. Key characteristics:

- **Non-Fungible**: Each NFT is unique and cannot be exchanged 1:1 like regular currency (unlike cryptocurrencies where 1 SOL = 1 SOL)
- **Ownership Proof**: The blockchain records who owns the NFT, providing verifiable proof of ownership
- **Metadata**: NFTs typically include metadata (name, description, image URL) that describes what the token represents

### Common Uses
- Digital art and collectibles
- Game items and characters
- Music and media rights
- Virtual real estate
- Event tickets
- Domain names

## What is a Collection?

An **NFT Collection** is a parent/master NFT that groups together related individual NFTs. Think of it like a folder or category that contains multiple items.

**Conceptual Example:**
- **Collection**: "Bored Ape Yacht Club"
  - Individual NFTs: Ape #1, Ape #2, Ape #3... Ape #10,000

- **Collection**: "Radu's Collection" (in this project)
  - Individual NFTs: Could be Art Piece #1, Art Piece #2, etc.

**Why Collections Exist:**

1. **Organization** - Groups related NFTs under a single identity, making it easy to browse/filter
2. **Branding** - Collection has its own name, symbol, and metadata providing shared identity
3. **Verification** - Proves an NFT belongs to an official collection, preventing fakes
4. **Shared Properties** - Common royalty settings, metadata, and attributes

**Collection Hierarchy:**

```
Collection NFT (isCollection: true)
├─ Address: FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R
├─ Name: "Radu's Collection"
├─ Symbol: RCOL
│
├─── Individual NFT #1
│    ├─ Name: "Viking Warrior #1"
│    └─ collection: FTwh5N... (points to parent)
│
├─── Individual NFT #2
│    ├─ Name: "Viking Warrior #2"
│    └─ collection: FTwh5N... (points to parent)
│
└─── Individual NFT #3
     ├─ Name: "Viking Warrior #3"
     └─ collection: FTwh5N... (points to parent)
```

**The `isCollection: true` Flag:**

This flag tells the Token Metadata program:
- This NFT is a collection parent (not a regular NFT)
- Other NFTs can reference this as their collection
- It serves as a verification point for collection membership

**What This Project Creates:**

This script creates **only the collection parent** - the container/brand identity. It doesn't create individual NFTs yet. You've essentially:
1. Created the "Radu's Collection" brand/identity
2. Set up the structure that can hold future NFTs
3. Established the collection's metadata and properties

The next step would be to mint individual NFTs that reference this collection as their parent.

**Real-World Analogy:**
- **Collection** = Netflix series (e.g., "Stranger Things")
- **Individual NFTs** = Individual episodes (S1E1, S1E2, etc.)
- Episodes belong to the series and share its branding

## What is Metaplex?

**Metaplex** is a protocol and set of tools for creating and managing NFTs and other digital assets on the Solana blockchain. It provides:

1. **NFT Standard**: A widely-adopted standard for creating NFTs on Solana, including metadata specifications and on-chain programs
2. **Token Metadata Program**: Smart contracts that store and manage NFT metadata (name, symbol, URI, royalties, etc.)
3. **Developer Tools**: SDKs and libraries to interact with NFTs programmatically
4. **Umi Framework**: A modular framework for building Solana applications with a plugin-based architecture

Metaplex is the dominant standard on Solana due to its maturity, widespread adoption, and comprehensive tooling.

## Project Setup

### Prerequisites
- Node.js installed
- A Solana wallet keypair (for devnet testing)

### Keypair Management and Best Practices

#### Understanding Keypairs

The script uses `getKeypairFromFile()` from `@solana-developers/helpers` to load your Solana keypair. By default, it reads from `~/.config/solana/id.json` - the default location created by the Solana CLI.

**Keypair Structure:**
- **File Format**: JSON array of 64 bytes representing your secret key
- **publicKey**: Your wallet's public address (visible on-chain)
- **secretKey**: Your private key (kept secret, used to sign transactions)

**Creating a Keypair:**
```bash
# Create default keypair
solana-keygen new

# Create named keypair
solana-keygen new -o ~/.config/solana/devnet.json
```

#### Best Practices: Separate Keypairs per Network

**✅ Recommended: Use different keypairs for each environment**

1. **Devnet** - Testing/development keypair(s)
2. **Testnet** - Pre-production testing keypair(s)  
3. **Mainnet** - Real funds keypair (treat like a bank account)

**Why Separate Keypairs?**

*Security:*
- Never expose mainnet private keys in development environments
- Devnet/testnet code may have bugs that could leak keys
- Development machines are less secure than production key storage
- Reduces risk of accidentally sending real funds in tests

*Organization:*
- Clear separation between test and production assets
- Different keypairs can have different security levels
- Easier to track which wallet did what on which network

**Managing Multiple Keypairs:**

```bash
# Create separate keypairs
solana-keygen new -o ~/.config/solana/devnet.json
solana-keygen new -o ~/.config/solana/testnet.json
solana-keygen new -o ~/.config/solana/mainnet.json

# Use specific keypair in code
const devUser = await getKeypairFromFile("~/.config/solana/devnet.json");

# Or switch default keypair
solana config set --keypair ~/.config/solana/devnet.json
```

#### Security Levels by Network

**Devnet/Testnet Keypairs:**
- ✅ Can be stored in filesystem
- ✅ Can be committed to private repos (if needed for team)
- ✅ No real financial risk

**Mainnet Keypairs:**
- 🔒 **NEVER commit to version control**
- 🔒 Use hardware wallets (Ledger) for significant funds
- 🔒 Consider multi-sig for DAOs/organizations
- 🔒 Store backups in secure, offline locations
- 🔒 Use environment variables or secure vaults in production
- 🔒 Hot wallet (small funds) vs cold wallet (bulk storage)

### Installation

1. Initialize your project:
```bash
npm init -y
```

2. Install required dependencies:
```bash
npm i @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi
npm i @solana-developers/helpers
```

3. Install Solana web3.js:
```bash
npm i @solana/web3.js
```

4. ES run
```bash
npm i esrun          
```
## Creating an NFT Collection

This project demonstrates how to create an NFT collection on Solana's devnet using Metaplex Token Metadata.

### Key Concepts

**Umi Framework**: A modular framework that simplifies Solana development
- Uses plugins for different functionality
- Provides a consistent API across Metaplex tools

**Required Imports**:
- `createUmi` from `@metaplex-foundation/umi-bundle-defaults` - Creates the Umi instance with RPC endpoint
- `keypairIdentity` from `@metaplex-foundation/umi` - Sets up wallet identity
- `mplTokenMetadata` - Plugin for Token Metadata program
- `@solana-developers/helpers` - Utility functions for airdrop and keypair management

### Code Walkthrough

The `create-collection.ts` file demonstrates the complete NFT collection creation process:

#### 1. Setup Connection and Load Wallet
```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = await getKeypairFromFile();
```
- Connects to Solana devnet
- Loads your wallet keypair from `~/.config/solana/id.json`
- This wallet will pay transaction fees and own the collection

#### 2. Request Airdrop (Devnet Only)
```typescript
await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
```
- Checks if wallet has at least 0.5 SOL
- If not, requests 1 SOL airdrop from devnet faucet
- Only works on devnet/testnet (mainnet requires purchasing SOL)

#### 3. Initialize Umi Framework
```typescript
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());
```
- Creates Umi instance configured for devnet
- Loads Token Metadata plugin for NFT functionality
- Umi provides a modular, developer-friendly API for Metaplex

#### 4. Set Up Identity
```typescript
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));
```
- Converts web3.js keypair to Umi format
- Tells Umi which wallet will sign transactions
- Required for Umi to authorize operations on your behalf

#### 5. Generate Collection Mint Address
```typescript
const collectionMint = generateSigner(umi);
```
- Creates a new random keypair for the collection
- This becomes the collection's unique on-chain address
- Different from your wallet - it's the NFT's identifier

**Understanding the Concept:**

On Solana, every token (including NFTs) needs a **mint account** - a unique on-chain account that represents the token itself.

**Key Points:**
- **It's NOT your wallet** - This is a completely new, random keypair
- **It's the NFT's identity** - This becomes the unique address/ID of your NFT collection
- **One-time generation** - A fresh keypair is generated each time you run the script
- **The mint address** - This public key becomes how people reference your collection

**Why Generate a New Keypair?**
- **Unique Identity**: Each NFT/collection must have a globally unique address on Solana
- **Separation of Concerns**: The mint account stores the token definition, while your wallet owns tokens from that mint
- **Program Ownership**: The mint account is owned by the Token Metadata program, not by you directly

**What's Generated:**
- **Private key** (secretKey) - Used once during creation to initialize the mint account
- **Public key** (publicKey) - Becomes the permanent address of the NFT collection (e.g., FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R)

#### 6. Create the NFT Collection
```typescript
const transaction = createNft(umi, {
    mint: collectionMint,
    name: "Radu's Collection",
    symbol: "RCOL",
    uri: "https://raw.githubusercontent.com/.../metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});
```
- Builds transaction to create NFT collection
- **mint**: The collection's unique address
- **name/symbol**: Human-readable identifiers
- **uri**: Link to off-chain metadata (JSON with image, description, attributes)
- **sellerFeeBasisPoints**: Royalty percentage (0 = no royalties, 500 = 5%)
- **isCollection**: Marks as collection that can contain multiple NFTs

#### 7. Send Transaction and Confirm
```typescript
const result = await transaction.sendAndConfirm(umi, {
    send: { commitment: 'finalized' },
    confirm: { commitment: 'finalized' }
});
```
- Sends transaction to Solana blockchain
- Waits for 'finalized' confirmation (highest security level)
- Returns transaction signature as proof

#### 8. Verify Creation
```typescript
const collectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
```
- Fetches the created NFT from blockchain
- Verifies it was created successfully
- Retrieves all on-chain metadata

### Visual Representation

Understanding the relationship between your wallet and the NFT collection:

```
Your Wallet (user)
├─ Pays transaction fees
├─ Signs as collection authority
└─ Owns the collection NFT

Collection Mint (collectionMint)  ← Generated by generateSigner()
├─ Unique address: FTwh5N...
├─ Stores: name, symbol, metadata URI
├─ Controlled by: Token Metadata program
└─ One NFT is minted to your wallet
```

**Two Different Keypairs:**
```
user = Your wallet keypair
├─ Example: 8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh
├─ Purpose: Pay fees, sign transactions, own NFTs
└─ Loaded from: ~/.config/solana/id.json

collectionMint = The NFT collection's mint keypair
├─ Example: FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R
├─ Purpose: Unique identifier for the collection
└─ Generated: Fresh random keypair each time script runs
```

### Ownership Model

**How NFT Ownership Works on Solana:**

1. **Mint Account (The Collection)**
   - Created by `createNft()` at the `collectionMint` address
   - Stores immutable data: name, symbol, metadata URI
   - Owned by the Token Metadata program
   - Acts as the "template" or "definition" of the NFT

2. **Token Account (Your Ownership)**
   - Associated token account created in your wallet
   - Contains 1 token (NFTs have supply of 1)
   - This proves you own the NFT
   - Can be transferred to other wallets

3. **Metadata Account**
   - Stores additional on-chain data
   - Linked to the mint account
   - Contains: creators, royalties, collection info
   - Also owned by Token Metadata program

**Analogy:**
- **Mint Account** = The product's barcode/SKU (identifies what it is)
- **Token Account** = Your receipt showing you own one unit
- **Metadata Account** = The product's detailed spec sheet

**Why This Matters:**
- Your wallet doesn't directly "contain" the NFT data
- Instead, you hold a token that represents ownership
- The actual NFT data lives in on-chain accounts
- This architecture enables efficient transfers and verifiable ownership

## Running the Project

```bash
npx esrun create-collection.ts  
```

## Example Output

Successfully created NFT collection on devnet:

```
Loaded user: 8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh
Set up Umi instance for user: 8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh
Creating NFT collection...
Collection address: FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R
Transaction confirmed: Uint8Array(64) [...]
Collection created for address: https://explorer.solana.com/address/FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R?cluster=devnet
```

**Collection Details:**
- **Address**: `FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R`
- **Name**: Radu's Collection
- **Symbol**: RCOL
- **Network**: Devnet
- **Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R?cluster=devnet)

### Notes
- If you encounter airdrop rate limiting errors (429), the script will continue if your wallet already has sufficient SOL balance
- The transaction uses `finalized` commitment level to ensure the account is fully created before fetching
- A 2-second delay is added after confirmation to allow RPC nodes to index the new account
