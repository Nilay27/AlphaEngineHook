# AlphaEngine — Private Swap v1 (Vault-as-Hook)
---

## Technical Design Document (TDD)

## 1) Why & What

### 1.1 Overview & Mission

AlphaEngine v1 enables **private swaps** on Uniswap v4 by combining a **shielded vault** (balances as encrypted fhERC20) with an **EigenLayer-style AVS** that privately decrypts user intents off-chain, simulates & batches them, and executes only **net** flow on AMMs. Users deposit plain ERC-20 once, receive **encrypted balances**, submit **encrypted swap intents**, and receive **encrypted outputs**. Only the vault interacts publicly with pools, preserving user-level sizes and linkage.

### 1.2 Goals & Success Criteria

1. Pre-execution **amount privacy** (no user size visible before execution).
2. Swap **obfuscation** via batching/netting (no per-user linkage to execution).
3. MEV minimization at last mile (hook gating + private inclusion).
4. End-to-end **slashable** validation (AVS quorum, deadlines, bounds).
5. Gas & latency targets: batched execution < 1 block window on L2, single swap < 2–3 blocks.
6. Correctness: settlement equals simulated fills; no negative vault balances.

### 1.3 Key Features & User Stories

- **Deposit & Shield**: *As a trader, I deposit 1,000 USDC and receive 1,000 eUSDC so my later swaps don’t reveal my wallet or size.*
- **Private Intent**: *As a trader, I submit “eUSDC→eUSDT 100” as an encrypted intent.*
- **Batched Execution**: *As a trader, I want my swap to be included in a batch so observers can’t link my deposit or intent to the execution.*
- **Withdraw Anywhere**: *As a trader, I can redeem eUSDT to any address to break linkage further.*

### 1.4 Non-Goals (v1)

- Cross-domain bridging of encrypted balances.
- Full ZK proofs of profitability (we rely on AVS sims + slashing/veto; ZK optional later).
- Generalized strategy DAGs (focus is **single-hop** Uniswap v4 swaps, USDC↔USDT initially).
- Fully private mempool (we’ll use private inclusion for execution; user intent tx is public but **encrypted**).

### 1.5 Assumptions & Dependencies

- EVM chain (L2 recommended).
- Fhenix **CoFHE** model (contract-driven FHE): encrypted types & ops via `FHE.sol`, **off-chain unseal permits** supported; on-chain decrypt writes to public storage (avoid for amounts).
- Uniswap v4 **PoolManager** & **Hook** model.
- AVS operator set + aggregator posting **quorum** on-chain.
- Private inclusion (e.g., Flashbots/SUAVE equivalent on chosen chain).

---

## 2) System Architecture & Design

### 2.1 High-Level (C4 L1–L2)

**Actors & External Systems**

- Trader (EOA)
- CoFHE Network (FHE Decryption Service)
- AVS Operators (committee) + Aggregator
- Uniswap v4 PoolManager & pools
- DA / Log storage (for ciphertext blobs if needed)

**Containers**

- **HookVault** (smart contract): Uniswap v4 Hook **and** shielded vault. Holds plain ERC-20 reserves; tracks user balances as fhERC20 (`eUSDC`, `eUSDT`). Exposes `deposit()`, `submitIntent()`, `withdraw()`. Performs encrypted adds/subs with `FHE.sol`.
- **TaskManager / ServiceManager** (smart contracts): task anchor, quorum records, slashing & reward accounting.
- **Operator Node** (off-chain): event listener, decryptor (MPC/ephemeral), simulator, batcher, signer.
- **Aggregator** (off-chain): collects operator signatures and posts **quorum** on-chain.
- **Snapshot Service** (off-chain): produces `snapshotCommit` (blockTag, reserves/prices used for sims).
- **Relayer/Executor** (off-chain): sends final exec tx via private inclusion.

### 2.2 On-chain Data (conceptual)

- `eBalance[token][user] : euint256` — encrypted balances per token.
- `Intent{ ctAmountHandle, ctMinOutHandle, tokenIn, tokenOut, nonce, deadline, owner }` — stored as references to ciphertext handles; not emitted.
- `BatchHdr{ batchId, snapshotCommit, cRoot, decryptorAddr, ttl }` — emitted in `TaskCreated`.
- `Bounds{ minOutPerLeg[], maxNetIn, maxNetOut }` — published by AVS; checked by gate.
- `Permits{ ctHandle → decryptorAddr, expiry }` — CoFHE unseal rights.

### 2.3 Component & Module Design (C4 L3)

**HookVault.sol**

Responsibilities:

- Deposit/withdraw; mint/burn fhERC20 via FHE adds/subs.
- `submitIntent()` stores ciphertext handles; issues CoFHE **permit** to `decryptorAddr` for this batch; emits `TaskCreated`.
- Uniswap v4 hook points (`beforeSwap/afterSwap`) act as **gate**: verify quorum & bounds; route **vault tokens** to PoolManager; update encrypted balances.
- Prevent direct user swaps on pool unless gate passes.

**TaskManager.sol / ServiceManager.sol**

- Create task (batch), record operator responses, finalize quorum.
- Slashing: equivocation, missed deadlines, violated bounds; rewards.
- Maintain operator registry/stake (restaking adapter).

**Operator Node**

- Watch `TaskCreated` → resolve ciphertexts (from DA or contract), **unseal** off-chain using CoFHE permit (decryptorAddr).
- Simulate on fixed `blockTag` snapshot; **net** intents; derive conservative `Bounds`.
- Sign `(batchId, Bounds, Routes, snapshotCommit)`; send to Aggregator.

**Aggregator**

- Collect k-of-n signatures, post `submitQuorum(batchId, Bounds, snapshotCommit, sigAgg)`.

**Snapshot Service**

- Build deterministic `snapshotCommit` (pool reserves, fees, oracle prices, interest params at `blockTag`).

**Relayer/Executor**

- Sends final `executeBatch(batchId, Bounds)` via private inclusion.

### 2.4 Detailed Flows (Sequence)

**A. Deposit (public)**

1. User `deposit(USDC, 1000)` → HookVault transfers USDC in.
2. HookVault: `eUSDC[user] = FHE.add(eUSDC[user], const(1000))`.
3. Emit `Deposited(user, token, 1000)`.

**B. Submit Intent (private amounts)**

1. Client encrypts `amount` (and optional per-intent `minOut`) → ciphertext handles.
2. `submitIntent(tokenIn=USDC, tokenOut=USDT, ctAmount, ctMinOut, deadline)`
3. HookVault stores handles, assigns `batchId`, **permits** `decryptorAddr` for these handles, emits:
    
    `TaskCreated(batchId, snapshotCommit, cRoot, decryptorAddr, ttl)`.
    

**C. AVS Decrypt + Sim + Net (off-chain)**

1. Decryptor uses `cofhejs.unseal(ctHandle, permit)` to get plaintext amounts.
2. Build fork at `blockTag`; simulate per intent; group & **net** across users; compute `Bounds` (per-leg `minOutBound`, `maxNetIn/Out`, exposure caps).
3. Operators sign; Aggregator posts `QuorumReached(batchId, Bounds, snapshotCommit)`.

**D. Execute Batch (public but aggregated)**

1. Relayer calls `executeBatch(batchId, Bounds)` through private inclusion.
2. Hook (gate) in `beforeSwap` checks: `hasQuorum`, `now ≤ ttl`, `bounds ok`.
3. HookVault spends **vault USDC** via PoolManager; receives USDT.
4. `afterSwap`: apply encrypted balance diffs per filled intents:
    - `eUSDC[user] = FHE.sub(eUSDC[user], ctFill[user])`
    - `eUSDT[user] = FHE.add(eUSDT[user], ctFill[user])`
        
        (fills are committed but not revealed; uses per-intent ctFill handles)
        

**E. Withdraw (optional)**

1. `withdraw(USDT, amt, recipient)` burns `eUSDT` and transfers USDT.

**F. Cancel / Expiry**

- If `deadline`/`ttl` elapses → intent invalidated via `cancelIntent`, permit revoked; no settlement.

---

## 3) Blockchain-Specific Essentials

### 3.1 Chain & Network Choice

- **Arbitrum / Base / OP Stack** recommended for cheap execution + private inclusion infra.
- **Justification**: Low gas for per-user encrypted balance updates; robust builder/relay ecosystem.

### 3.2 Smart Contract Architecture

**HookVault.sol (Uniswap v4 Hook + Shielded Vault)**

- **State**:
    - `mapping(address token => mapping(address user => euint256 eBal))`
    - `mapping(bytes32 intentId => Intent)` (stores ct handles)
    - `mapping(bytes32 batchId => BatchState)`
    - `PoolManagerLike poolManager; address usdc; address usdt;`
- **Functions**:
    - `deposit(token, amount)` — transfer in, `FHE.add`.
    - `withdraw(token, amount, recipient)` — `FHE.sub`, transfer out.
    - `submitIntent(tokenIn, tokenOut, ctAmount, ctMinOut, deadline)` — store intent, **permit decrypt**, emit `TaskCreated`.
    - `revokeIntent(intentId)` — before batch sealed; revoke permits.
    - `executeBatch(batchId, Bounds, sigAgg)` — hook gate path; calls PoolManager; updates encrypted balances.
    - Uniswap hook selectors: `beforeSwap`, `afterSwap` return deltas only when gate passes.
- **Events**: `Deposited`, `Withdrew`, `TaskCreated`, `QuorumReached`, `BatchExecuted`, `IntentSettled`, `IntentExpired`.
- **Modifiers**: `onlyExecutor` (relayer), `onlyPoolManager`, `nonReentrant`.
- **Notes**: The contract *can* hold ERC-20 balances; the Uniswap hook interface does not forbid custom methods.

**TaskManager.sol**

- `createTask(batchId, snapshotCommit, cRoot, decryptorAddr, ttl)`
- `respond(batchId, sig)`; `finalize(batchId, bounds, sigAgg)`
- `hasQuorum(batchId) view returns (bool)`
- Events: `TaskCreated`, `ResponseReceived`, `QuorumReached`.

**ServiceManager.sol**

- Operator registry, stake, **slash(signers, reasonCode)**, **reward(signers, amount)**.
- Reasons: late, equivocation (two different bounds for same batch), invalid bounds vs snapshot, invalid quorum.

### 3.3 On-chain vs Off-chain

**On-chain**

- Encrypted balances, intent handles, permits to decryptorAddr.
- Task anchor, quorum, slashing.
- Gate checks, swaps via PoolManager, encrypted settlement.
- Public data: deposits, batch headers, aggregated swaps, withdrawals.

**Off-chain**

- Decrypt (CoFHE unseal) to **ephemeral decryptor EOA** (or MPC address).
- Simulation & netting (fork at `blockTag`).
- Signature aggregation & posting.
- Snapshot generation.

### 3.4 Security Considerations

**Threats & Mitigations**

- **User-level privacy leak at execution** → spend from **vault** only; batch & net; private inclusion.
- **Operator plaintext leakage** → **ephemeral decryptor per batch**; MPC control; legal + slashing; minimize who can unseal.
- **Equivocation** (two bounds for one batch) → slash signers; bind to `snapshotCommit`.
- **State drift** (snapshot stale) → gate enforces `ttl`; bounds include tolerances; abort if drift > x bps.
- **Reentrancy / approvals** → OZ `ReentrancyGuard`, pull-then-effect, minimal external calls.
- **Permit misuse** → per-intent, per-batch permits with expiry; revoke on cancel; log allowlist changes.
- **DoS via huge batches** → cap intents per batch; paging; gas-aware settlement loop.
- **Hook abuse** → pools must register this hook id; gate rejects non-batch swaps.
- **Key management** → decryptor keys in MPC; rotate per batch; store nothing long-term.

---

## 4) Implementation Details

### 4.1 Tech Stack

- **Contracts**: Solidity (0.8.x), Hardhat/Foundry, Uniswap v4 interfaces, OpenZeppelin, `FHE.sol` (CoFHE).
- **Off-chain**: TypeScript/Node for Operator Node, Aggregator, Snapshot Service; ethers.js/viem.
- **DB/Cache**: Postgres (intents, batches, signatures, snapshots), Redis for queues.
- **Infra**: Docker, GitHub Actions CI, Helm/K8s or ECS; secure HSM/MPC service for decryptor keys.
- **Relays**: Flashbots-like private relay / SUAVE equivalent on chosen chain.

### 4.2 APIs (sketch)

- `/snapshots/:blockTag` → returns snapshot root & details (deterministic).
- `/operator/tasks/pending` → lists `TaskCreated` needing sims.
- `/operator/tasks/:batchId/submit` → operator signature payload.
- `/aggregator/quorum` → posts aggregate signature on-chain.

### 4.3 DevOps & Environments

- **Local**: anvil + mocked CoFHE (handles resolved to plaintext for tests).
- **Testnet**: deploy HookVault & TaskManager; small operator set.
- **Staging**: enable private inclusion & MPC; load tests with synthetic intents.
- **Prod**: progressive decentralization of operator set; slashing live.

---

## 5) Data Architecture (off-chain ERD, brief)

- **intents**(intent_id, user, token_in, token_out, ct_amount_hash, ct_minout_hash, batch_id, status, created_at)
- **batches**(batch_id, snapshot_commit, c_root, decryptor_addr, ttl, status)
- **bounds**(batch_id, leg_idx, min_out_bound, max_net_in, max_net_out)
- **operator_sigs**(batch_id, operator_addr, sig, created_at)
- **snapshots**(commit, block_tag, json_blob, created_at)

---

## 6) Detailed Logic (pseudo)

**submitIntent**

```solidity
function submitIntent(
  address tokenIn, address tokenOut,
  bytes32 ctAmount, bytes32 ctMinOut, uint64 deadline
) external {
  bytes32 intentId = keccak256(...);
  intents[intentId] = Intent(ctAmount, ctMinOut, tokenIn, tokenOut, msg.sender, deadline);
  // assign to active batch
  bytes32 batchId = currentBatchId();
  // Permit decrypt for this intent to decryptorAddr for batchId
  permits.grant(ctAmount, decryptorAddr[batchId], ttl[batchId]);
  emit TaskCreated(batchId, snapshotCommit, cRoot, decryptorAddr[batchId], ttl[batchId]);
}

```

**executeBatch**

```solidity
function executeBatch(bytes32 batchId, Bounds calldata b, bytes calldata sigAgg) external onlyExecutor {
  require(taskManager.hasQuorum(batchId, b, sigAgg), "!quorum");
  require(block.timestamp <= batches[batchId].ttl, "stale");
  require(checkBounds(b, batches[batchId].snapshotCommit), "!bounds");

  // Spend vault USDC -> USDT net amount (b.maxNetIn etc.)
  _swapVault(USDC, USDT, b.netIn, b.minOut);

  // For each settled intent, update encrypted balances
  for (bytes32 intentId : batches[batchId].intentLeafs) {
     // ctFill chosen by AVS per intent (kept encrypted; contract receives handle)
     eUSDC[user] = FHE.sub(eUSDC[user], intents[intentId].ctFill);
     eUSDT[user] = FHE.add(eUSDT[user], intents[intentId].ctFill);
     intents[intentId].status = Settled;
     emit IntentSettled(intentId);
  }
}

```

---

## 7) Privacy Analysis (state-by-state)

- **Deposit**: amount & sender public (acceptable).
- **Intent submission**: encrypted handles only; **no plaintext** in calldata/events.
- **Permits**: show `decryptorAddr` & batch metadata; plaintext remains private.
- **Simulation**: plaintext known only to **ephemeral decryptor committee**.
- **Execution**: aggregated swap size public; **user sizes remain private**.
- **Settlement**: encrypted balance updates; no per-user amounts leaked.
- **Withdraw**: public; allow arbitrary recipient to break linkage.

Mitigations: batching/netting, time windows, relayer caller, private inclusion, ephemeral decryptor per batch.

---

## 8) Open Questions & v2 Roadmap

- **ZK add-on**: replace AVS correctness with succinct proofs for bounds or profitability (AVS kept for liveness).
- **Multi-hop routing**: generalize bounds & gate logic to N-leg paths.
- **Cross-chain**: bridge encrypted balances with message-authenticated reveals.
- **Operator incentives**: dynamic fees, performance-based rewards.
- **Threat model hardening**: formal privacy budget; padding/decoys for small batches.

---

## 9) Validity Check (your last question)

> “From the user POV, are tokens always encrypted post-deposit?”
> 

Yes. After `deposit()`, the user holds **eUSDC** (encrypted balance). Every later action uses **only vault funds** on AMMs; user balance changes are applied as **encrypted adds/subs**. No user ERC-20 transfer occurs at execution, so per-user sizes remain private pre-execution. Execution reveals **only** the **aggregate** swap size by the vault.

If you want, I can follow up with:

- a minimal **HookVault** stub (Solidity) with `deposit/submitIntent/executeBatch` signatures,
- the **TaskManager** interface,
- and the Operator Node **runbook** (decrypt → simulate → net → sign → post).