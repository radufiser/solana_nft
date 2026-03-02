# Solana NFT Tutorial

> **Learning Goal**: By the end of this tutorial, you'll understand NFT fundamentals and create your first NFT collection on Solana

A hands-on, beginner-friendly guide to creating NFT collections on Solana using Metaplex.

## 📚 Table of Contents
1. [Core Concepts](#core-concepts) - NFTs, Collections, and Metaplex
2. [Mental Models](#mental-models) - How to think about Solana NFTs
3. [Project Setup](#project-setup) - Getting your environment ready
4. [Code Walkthrough](#code-walkthrough) - Understanding every line
5. [Common Mistakes](#common-mistakes) - Avoid these pitfalls
6. [Next Steps](#next-steps) - What to learn after this

---

## Core Concepts

### What is an NFT?

An **NFT (Non-Fungible Token)** is a unique digital asset stored on a blockchain that represents ownership of a specific item.

**🔑 Core Idea**: Think of an NFT like a certificate of authenticity for a piece of art, but stored on the blockchain instead of paper.

**Key Characteristics**:

- **Non-Fungible**: Each NFT is unique and cannot be exchanged 1:1 like regular currency
  - Example: Trading a $20 bill for another $20 bill = same value (fungible)
  - Example: Trading the Mona Lisa for another painting ≠ same value (non-fungible)
  
- **Ownership Proof**: The blockchain is an immutable, public ledger that records ownership
  - Anyone can verify you own the NFT by checking the blockchain
  - No central authority needed - the blockchain is the source of truth
  
- **Metadata**: NFTs include data describing what the token represents
  - **On-chain**: Basic info stored directly on the blockchain (name, symbol)
  - **Off-chain**: Detailed info stored externally (image, description, attributes)

### Common Uses
- Digital art and collectibles
- Game items and characters
- Music and media rights
- Virtual real estate
- Event tickets
- Domain names

### What is a Collection?

An **NFT Collection** is a parent/master NFT that groups together related individual NFTs.

**💡 Real-World Analogy**:
```
Collection = A Book Series (e.g., Harry Potter)
├─ Harry Potter and the Sorcerer's Stone
├─ Harry Potter and the Chamber of Secrets
├─ Harry Potter and the Prisoner of Azkaban
└─ ... (all books share the same brand/universe)
```

**Blockchain Example**:
- **Collection**: "Bored Ape Yacht Club" (the brand/parent)
  - Individual NFTs: Ape #1, Ape #2, Ape #3... Ape #10,000 (the items)

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

### What is Metaplex?

**Metaplex** is the industry-standard protocol for creating NFTs on Solana.

**🎯 Why Metaplex Exists**: Without standards, every developer would create NFTs differently, making marketplaces and wallets incompatible. Metaplex provides the common language.

**What It Provides**:

1. **NFT Standard** - The widely-adopted format for Solana NFTs
   - Like MP3 for music or JPEG for images
   - Ensures your NFTs work everywhere (OpenSea, Magic Eden, etc.)
   
2. **Token Metadata Program** - Smart contract that stores NFT data on-chain
   - Lives at a well-known address on Solana
   - Manages: name, symbol, URI, royalties, collection links
   
3. **Developer Tools** - SDKs to interact with NFTs
   - **Umi Framework**: Modern, modular toolkit (what we use)
   - Handles complexity so you focus on your logic
   
4. **Ecosystem Support** - Used by all major Solana NFT platforms
   - Marketplaces read Metaplex format automatically
   - Wallets display your NFTs correctly

**Market Position**: 95%+ of Solana NFTs use Metaplex due to its maturity and ecosystem adoption.

---

## Mental Models

> Understanding these mental models will make everything click

### 1. Accounts Are Storage Units

**On Solana, everything is an account** - your wallet, tokens, NFTs, programs (smart contracts).

```
┌─────────────────────────────────────────┐
│  Account (On-Chain Storage)             │
├─────────────────────────────────────────┤
│  • Address (Public Key)                 │
│  • Owner (Which program controls it)    │
│  • Data (The stored information)        │
│  • Lamports (Rent/balance)              │
└─────────────────────────────────────────┘
```

**Example - Your Wallet**:
- Address: `8Q4gyVRn...TizGgCh`
- Owner: System Program
- Data: Nothing (it just holds SOL)
- Lamports: 2.5 SOL

**Example - An NFT Mint Account**:
- Address: `FTwh5Nhh...bHV17R`
- Owner: Token Metadata Program
- Data: Name, symbol, URI, supply = 1
- Lamports: Rent (minimum balance)

### 2. Three Accounts Per NFT

When you create an NFT, you actually create **three linked accounts**:

```
┌──────────────────────┐
│   Mint Account       │  ← The NFT's definition/identity
│   (What it is)       │     Address: FTwh5Nhh...bHV17R
└──────────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Metadata Account    │  │  Token Account       │
│  (Description)       │  │  (Ownership)         │
│  Name, URI, etc.     │  │  Owner: Your Wallet  │
│                      │  │  Amount: 1           │
└──────────────────────┘  └──────────────────────┘
```

**Key Insight**: The NFT data lives in separate accounts. Your wallet holds a "token account" that points to the mint, proving ownership.

### 3. Programs Own Accounts

**Critical Concept**: On Solana, you don't directly control all accounts. Programs do.

```
Your Wallet (System Program)  ← You control this via your private key
    │
    └─ Owns: Token Account     ← You control this indirectly
              │
              └─ Points to: Mint Account (Token Metadata Program owns this)
                               │
                               └─ Metadata Account (Token Metadata Program owns this)
```

**Why This Matters**: You can't manually edit the mint or metadata accounts. Only the Token Metadata Program can. You interact through Metaplex's instructions.

---

## Project Setup

### Prerequisites
- **Node.js** (v16+) - JavaScript runtime
- **Solana CLI** (optional but recommended) - For keypair generation
- **A Solana wallet keypair** - For devnet testing (free testnet tokens)

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

---

## Code Walkthrough

> Let's understand every line of code and why it's needed

The [create-collection.ts](create-collection.ts) file demonstrates the complete NFT collection creation process.

**🎓 Learning Approach**: Read each section below, then look at the corresponding code. The code comments reference these sections.

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

**🔑 Critical Concept: The Mint Account**

This is one of the most confusing parts for beginners. Let's break it down:

**What's Happening:**
- Creates a **new random keypair** for the NFT collection
- This keypair's public key becomes the collection's permanent blockchain address
- It's **NOT your wallet** - it's a completely separate account

**Mental Model:**
```
Your Wallet (user)                    Collection Mint (collectionMint)
├─ Address: 8Q4gyV...TizGgCh          ├─ Address: FTwh5N...bHV17R
├─ You control with private key       ├─ Created then owned by Token Program
├─ Holds SOL and token accounts       ├─ Stores NFT definition (name, symbol)
└─ Pays fees and signs transactions   └─ The NFT's permanent identity
```

**Why a New Keypair?**

1. **Unique Identity**: Each NFT needs a globally unique address on Solana
   - Like ISBN for books or VIN for cars
   - The address IS the NFT - you reference it everywhere

2. **Separation of Concerns**:
   - Mint account = The NFT definition (owned by Token Metadata Program)
   - Token account = Your ownership proof (owned by you)
   - This enables secure transfers and marketplace operations

3. **One-Time Use**: The private key signs the creation transaction, then is typically discarded
   - The public key becomes the permanent NFT address
   - You don't need the private key after creation

**Real Example from This Project:**
```
Generated Mint Address: FTwh5NhhjgsPnqgMFhusxuZYJWrZaaSLz4ohvGbHV17R
                       ↑
This becomes the collection's permanent address on Solana
Marketplaces, wallets, and other NFTs reference this address
```

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

---

## Common Mistakes

> Learn from others' errors - avoid these common pitfalls

### 1. ❌ Confusing Your Wallet with the Mint Account

**Wrong Mental Model:**
"My wallet address is the NFT address"

**Correct Mental Model:**
```
Your Wallet: 8Q4gyV...TizGgCh (holds the NFT)
NFT Address: FTwh5N...bHV17R (the NFT itself)

Your wallet OWNS the NFT, but they are separate accounts
```

### 2. ❌ Thinking NFT Images Live On-Chain

**Reality**: Only metadata URI is on-chain. Images are stored off-chain (IPFS, Arweave, or traditional servers)

```
On-Chain (Solana Blockchain):
├─ Name: "Radu's Collection"
├─ Symbol: "RCOL"
└─ URI: "https://raw.githubusercontent.com/.../metadata.json"  ← Points to...

Off-Chain (GitHub/IPFS):
└─ metadata.json
    ├─ "name": "Radu's Collection"
    ├─ "description": "..."
    └─ "image": "https://.../image.png"  ← Actual image URL
```

**Why**: Storing images on-chain would be prohibitively expensive (Solana charges rent per byte)

### 3. ❌ Not Understanding Commitment Levels

**Commitment = How "final" a transaction is**

- `processed` - Transaction processed, might be rolled back (FAST, RISKY)
- `confirmed` - Confirmed by cluster, unlikely to roll back (BALANCED)
- `finalized` - Maximum confirmation, cannot roll back (SLOW, SAFE)

**Best Practice**: Use `finalized` for NFT creation to ensure accounts fully exist

### 4. ❌ Forgetting Airdrop Limits on Devnet

**Error**: "Airdrop request limit exceeded"

**Solution**: 
- Devnet rate limits: ~5 SOL per hour per IP
- Use faucets: https://faucet.solana.com
- Check balance first: `solana balance`

### 5. ❌ Using Devnet Keypairs on Mainnet

**NEVER** use the same keypair across networks!

```bash
# ✅ GOOD: Separate keypairs per network
solana-keygen new -o ~/.config/solana/devnet.json
solana-keygen new -o ~/.config/solana/mainnet.json

# ❌ BAD: Same keypair everywhere
solana-keygen new  # Don't use default for everything
```

### 6. ❌ Not Waiting for Account Creation

**Problem**: Fetching account immediately after creation fails

**Why**: RPC nodes need time to index new accounts (~1-2 seconds)

**Solution**: Add small delay or retry logic
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## Running the Project

### Quick Start

```bash
# Run the NFT collection creation script
npx esrun create-collection.ts  
```

### Troubleshooting

**Issue**: "Cannot find module"
```bash
npm install  # Reinstall dependencies
```

**Issue**: "Keypair file not found"
```bash
solana-keygen new  # Generate default keypair
```

**Issue**: "Insufficient funds"
```bash
solana airdrop 1  # Request devnet SOL
# OR visit https://faucet.solana.com
```

## Example Output

Successfully created NFT collection on devnet:

```
Loaded [user](https://explorer.solana.com/address/8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh/tokens?cluster=devnet)
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

### Understanding the Output

When you run the script successfully, you'll see:

```bash
Loaded user: 8Q4gyV...TizGgCh          # Your wallet address
Set up Umi instance for user: ...      # Umi configured with your identity
Creating NFT collection...              # Building the transaction
Collection address: FTwh5N...bHV17R    # The NEW mint account address
Transaction confirmed: Uint8Array(64)   # Transaction signature (proof)
Collection created: https://explorer.solana.com/address/...  # View on explorer
```

**🔍 What to Check:**
1. **Explorer Link** - Click it to see your collection on Solana Explorer
2. **Metadata** - Verify name, symbol, and URI are correct
3. **Token Balances** - You should own 1 token (the collection NFT)

### Technical Notes
- **Airdrop Rate Limiting**: Devnet limits to ~5 SOL/hour. Script continues if you have sufficient balance
- **Finalized Commitment**: Ensures account fully exists before fetching (adds ~1-2 seconds)
- **2-Second Delay**: Gives RPC nodes time to index the new account

---

## Next Steps

> You've created a collection. Now what?

### 1. Mint Individual NFTs into the Collection
- Create NFTs that reference this collection as their parent
- Use `createNft()` with `collection` parameter set to your collection address

### 2. Upload Metadata to IPFS/Arweave
- Learn about decentralized storage (IPFS, Arweave)
- Ensures metadata persists forever without centralized servers

### 3. Add NFT Attributes and Traits
- Explore the metadata JSON standard
- Add properties like "rarity", "strength", "color"
- Marketplaces display these attributes automatically

### 4. Implement Royalties
- Set `sellerFeeBasisPoints` (e.g., 500 = 5% royalty)
- Earn on secondary sales when NFTs are resold

### 5. Build a Minting UI
- Create a web interface for users to mint NFTs
- Use `@solana/wallet-adapter-react` for wallet connections
- Call your minting logic from the frontend

### 6. Learn About:
- **Candy Machine** - Metaplex's NFT distribution/launch platform
- **Token Extensions** - New Solana token features (transfer hooks, metadata extensions)
- **Compression** - Compressed NFTs for low-cost minting (1000s of NFTs for pennies)
- **Programmable NFTs** - NFTs with custom rules and logic

### Resources
- [Metaplex Docs](https://docs.metaplex.com/) - Official documentation
- [Solana Cookbook](https://solanacookbook.com/) - Code examples and patterns
- [Solana Playground](https://beta.solpg.io/) - Browser-based Solana IDE
- [Metaplex GitHub](https://github.com/metaplex-foundation) - Source code and examples

---

## Key Takeaways

✅ **NFTs are unique tokens** with metadata pointing to images/attributes

✅ **Collections group related NFTs** under a parent brand

✅ **Three accounts per NFT**: Mint (definition), Metadata (details), Token (ownership)

✅ **Metaplex is the standard** - ensures compatibility across all Solana platforms

✅ **Umi simplifies development** - modern SDK with plugin architecture

✅ **Security matters** - separate keypairs per network, never commit mainnet keys

---

## Running the Scripts

### Create Collection NFT

```bash
npx esrun create-collection.ts
```

### Create Individual NFT

```bash
npx esrun create-nft.ts
```

**Example Output:**
```
Airdrop failed (you may already have sufficient balance): 429 Too Many Requests
Loaded user: 8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh
Set up Umi instance for user: 8Q4gyVRnzcUeF1x7FTLAJu6s8HRXn6tfEDQi3TizGgCh
Creating NFT...
✅ NFT Created Successfully!
   Mint Address: 5UGsJV5pBPwRZmm68ZNHxUQQk6rNUGhDFeUEMzcircUi
   Explorer Link: https://explorer.solana.com/address/5UGsJV5pBPwRZmm68ZNHxUQQk6rNUGhDFeUEMzcircUi?cluster=devnet

Verifying NFT creation...
✅ Verification successful! NFT name: Radu's First NFT
```

**Note:** If you see airdrop errors, that's normal - your wallet likely has sufficient SOL already. The devnet faucet has rate limits.

---

**Questions or Issues?** Review the [Common Mistakes](#common-mistakes) section or check the Solana Discord for help.

**Ready to Build?** Start with [Next Steps](#next-steps) to expand your NFT knowledge.
