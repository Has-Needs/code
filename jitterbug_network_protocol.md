A per‑message, header‑driven, neighbor‑aware port‑expansion rule, where  open_n  encodes the remaining ‘expansion budget’ that gradually collapses back to normal 1:1 traffic as the message propagates.

## Jitterbug Port-Expansion Rule (per message)

### Message header

- `open_n`: integer, $$n \ge 0$$.  
  - `open_0` = normal traffic, no expansion.  
  - `open_n>0` = this message carries an “expansion budget” of $$n$$ hops.

### Node-local state (conceptual)

- `ports_total`: max simultaneous connections this node *can* open.  
- `ports_used`: current number of open ports.  
- `expanded_ports`: number of **temporary** ports opened due to Jitterbug.  
- `expanded_budget`: remaining number of messages allowed to use those temporary ports before they are closed.

Exact values are implementation choices; the protocol only assumes they are bounded.

***

## Node behavior on receiving a message `m` with header `open_n`

Pseudocode style:

```text
on_receive(m, open_n):

  if open_n > 0:
      if is_busy():
          handle_busy_with_open(m, open_n)
      else:
          handle_not_busy_with_open(m, open_n)
  else:
      handle_normal(m)  // open_0
```

### 1. Busy node with `open_n > 0`

```text
handle_busy_with_open(m, open_n):

  if can_expand_ports():
      // Open temporary capacity for a limited window
      expanded = open_additional_ports(k)   // k is small, bounded
      expanded_ports += expanded
      expanded_budget += B                  // B = how many messages may use these extra ports

      forward(m, open_n)                    // Do NOT decrement here; expansion happened locally
  else:
      queue_or_drop(m)                      // Local policy (queue with backoff, or drop)
```

Key points:

- A node is “busy” when `ports_used == ports_total` (or an equivalent local threshold).  
- `can_expand_ports()` must enforce an upper bound so a node doesn’t expand indefinitely (e.g., `ports_total + expanded_ports <= HARD_LIMIT`).  
- Expansion is tied to a **budget**: after `expanded_budget` messages have used the extra ports, they are closed.

### 2. Not-busy node with `open_n > 0`

```text
handle_not_busy_with_open(m, open_n):

  next_open = open_n - 1

  forward(m, next_open)
```

Key points:

- This node doesn’t need to expand; it just forwards the message and decrements the expansion budget in the header.  
- As `open_n` counts down toward 0 across the path, the network contracts back to normal behavior.

### 3. Node with `open_0` (normal traffic)

```text
handle_normal(m):

  // No expansion allowed
  forward(m, open_0) or queue_or_drop(m) based on local capacity
```

Key points:

- Messages with `open_0` **never** trigger expansion.  
- They are handled with normal 1:1 routing and backpressure.

***

## Sender-side initiation

When a sender detects congestion locally (e.g., repeated busy responses or queue thresholds), it can initiate expansion for that *specific* message:

```text
send_with_jitterbug(m):

  if is_congested():
      header = open_N    // e.g., N=3, protocol constant
  else:
      header = open_0

  forward(m, header)
```

- `N` is the maximum expansion radius per message.  
- Different senders can pick `open_N` independently; there is no global “mode.”

***

## Invariants / Safety Properties

- **Local-only decisions:** No node needs global topology knowledge; behavior is purely based on local busy/not-busy state and `open_n`.  
- **Self-limiting expansion:**
  - Per-message: bounded by initial `N`.  
  - Per-node: bounded by `HARD_LIMIT` on `expanded_ports` and `expanded_budget`.  
- **Convergence:** As messages move through non-busy nodes, `open_n` monotonically decreases until it reaches `open_0`, after which routing is normal.
