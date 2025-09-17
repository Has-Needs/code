import random
import collections
import time
from typing import Dict, List, Set, Optional, Any

class Transaction:
    def __init__(self, tx_id: str, participants: List[str], data: Dict):
        self.tx_id = tx_id
        self.participants = sorted(participants)  # Consistent ordering
        self.data = data
        self.timestamp = time.time()

class NetworkNode:
    def __init__(self, node_id: str, is_sybil: bool = False):
        self.node_id = node_id
        self.is_sybil = is_sybil
        self.chain: Dict[str, Transaction] = {}
        self.greylisted = False
        self.known_discrepancies: Set[str] = set()
        self.successful_interactions: Dict[str, int] = collections.defaultdict(int)
        self.trust_threshold = 20
        self.trust_scores: Dict[str, float] = collections.defaultdict(float)

    def verify_trust(self, target_node: 'NetworkNode', network: 'Network') -> Dict[str, Any]:
        """Simulate the trust verification UI flow"""
        result = {
            'status': 'verifying',
            'confidence': 0.0,
            'hops': 0,
            'trusted_path_found': False,
            'network_available': network.is_online()
        }
        
        if not result['network_available']:
            result['status'] = 'verification_paused'
            return result
            
        if not self.chain:
            result['status'] = 'no_transaction_history'
            return result
            
        tx = random.choice(list(self.chain.values()))
        visited = set()
        max_hops = 20
        
        while result['confidence'] < 0.99 and result['hops'] < max_hops:
            result['hops'] += 1
            participants = [p for p in tx.participants if p in network.nodes]
            
            trusted = [p for p in participants 
                      if network.nodes[p]._is_trusted(threshold=self.trust_threshold)]
            
            if trusted:
                result['trusted_path_found'] = True
                result['confidence'] = min(1.0, result['confidence'] + 0.5)
                break
                
            next_node_id = self._select_next_hop(participants, network, visited)
            if not next_node_id:
                break
                
            next_node = network.nodes[next_node_id]
            visited.add(next_node_id)
            
            if self._verify_chain_consistency(next_node.chain, tx):
                result['confidence'] = 1 - (0.5 ** result['hops'])
            else:
                result['confidence'] *= 0.8
                
            if not next_node.chain:
                break
            tx = random.choice(list(next_node.chain.values()))
            
        if result['confidence'] >= 0.99:
            result['status'] = 'verified'
        elif result['confidence'] >= 0.7:
            result['status'] = 'likely_verified'
        else:
            result['status'] = 'unverified'
            
        return result

    def _is_trusted(self, threshold: int) -> bool:
        return sum(self.successful_interactions.values()) > threshold * 10

    def _select_next_hop(self, participants: List[str], network: 'Network', 
                        visited: Set[str]) -> Optional[str]:
        available = [p for p in participants 
                    if p != self.node_id 
                    and p not in visited
                    and p in network.nodes]
        return random.choice(available) if available else None

    def _verify_chain_consistency(self, chain: Dict[str, Transaction], 
                                 tx: Transaction) -> bool:
        if tx.tx_id not in chain:
            return False
        return chain[tx.tx_id].data == tx.data

    def should_interact_with(self, other_node: 'NetworkNode') -> bool:
        """Determine if this node should interact with another node based on history"""
        if not other_node.greylisted:
            return True
        return (self.successful_interactions.get(other_node.node_id, 0) >= 
                self.trust_threshold)

class Network:
    def __init__(self):
        self.nodes: Dict[str, NetworkNode] = {}
        self.transactions: Dict[str, Transaction] = {}
        self.global_greylist: Set[str] = set()
        self.online = True
        
    def is_online(self) -> bool:
        return self.online
        
    def simulate_network_issue(self, is_online: bool):
        self.online = is_online
        
    def add_node(self, node: NetworkNode):
        self.nodes[node.node_id] = node
        
    def broadcast_transaction(self, tx: Transaction) -> bool:
        """Broadcast transaction with strict consistency checks"""
        if not self.online:
            return False
            
        if tx.tx_id in self.transactions:
            return False
            
        if any(pid in self.global_greylist for pid in tx.participants):
            return False

        for node_id in tx.participants:
            if node_id in self.nodes:
                node = self.nodes[node_id]
                if node.greylisted:
                    return False
                for tx_id, existing_tx in node.chain.items():
                    if tx_id in self.transactions and \
                       self.transactions[tx_id].data != existing_tx.data:
                        self._handle_inconsistency(tx.participants)
                        return False
        
        self.transactions[tx.tx_id] = tx
        for node_id in tx.participants:
            if node_id in self.nodes:
                node = self.nodes[node_id]
                node.chain[tx.tx_id] = tx
                for other_id in tx.participants:
                    if other_id != node_id:
                        node.successful_interactions[other_id] += 1
        return True
        
    def _handle_inconsistency(self, participant_ids: List[str]):
        """Handle chain inconsistency by greylisting all participants"""
        for node_id in participant_ids:
            if node_id in self.nodes:
                node = self.nodes[node_id]
                node.greylisted = True
                self.global_greylist.add(node_id)
                node.successful_interactions.clear()

def run_antigaming_simulation(num_honest: int = 9900, 
                            num_sybils: int = 100, 
                            total_rounds: int = 1000):
    """Run the anti-gaming simulation with the specified parameters"""
    network = Network()
    
    # Create and add nodes
    for i in range(num_honest):
        network.add_node(NetworkNode(f'honest_{i}'))
    for i in range(num_sybils):
        network.add_node(NetworkNode(f'sybil_{i}', is_sybil=True))
    
    # Track statistics
    stats = {
        'interactions_attempted': 0,
        'interactions_successful': 0,
        'greylist_events': 0,
        'trust_verifications': 0,
        'network_issues': 0
    }
    
    # Main simulation loop
    for round_num in range(total_rounds):
        # Randomly simulate network issues (1% chance)
        if random.random() < 0.01:
            network.simulate_network_issue(False)
            stats['network_issues'] += 1
        elif not network.is_online() and random.random() < 0.1:
            network.simulate_network_issue(True)
        
        # Select random nodes to interact
        node1, node2 = random.sample(list(network.nodes.values()), 2)
        
        # Run trust verification
        trust_result = node1.verify_trust(node2, network)
        if trust_result['status'] == 'verification_paused':
            continue
            
        stats['trust_verifications'] += 1
        
        # Skip if nodes won't interact due to greylist or low trust
        if (node1.greylisted or node2.greylisted or 
            trust_result['status'] == 'unverified'):
            continue
            
        stats['interactions_attempted'] += 1
        
        # Create transaction
        tx_id = f"tx_{round_num}_{node1.node_id[:4]}_{node2.node_id[:4]}"
        tx = Transaction(tx_id, [node1.node_id, node2.node_id], {"value": "test"})
        
        # Sybils will sometimes create invalid transactions
        if (node1.is_sybil or node2.is_sybil) and random.random() < 0.3:
            tx.data["value"] = "malicious"
            
        if network.broadcast_transaction(tx):
            stats['interactions_successful'] += 1
        else:
            stats['greylist_events'] += 1
    
    # Calculate and print results
    num_greylisted = len([n for n in network.nodes.values() if n.greylisted])
    num_sybils_greylisted = len([n for n in network.nodes.values() 
                               if n.greylisted and n.is_sybil])
    
    print("\n=== Enhanced Anti-Gaming Simulation Results ===")
    print(f"Total nodes: {len(network.nodes):,} ({num_sybils} sybils)")
    print(f"Nodes greylisted: {num_greylisted} ({num_sybils_greylisted} sybils)")
    print(f"Greylist events: {stats['greylist_events']}")
    print(f"Network issues simulated: {stats['network_issues']}")
    print(f"Trust verifications: {stats['trust_verifications']}")
    if stats['interactions_attempted'] > 0:
        success_rate = (stats['interactions_successful'] / 
                       stats['interactions_attempted'] * 100)
        print(f"Interaction success rate: {success_rate:.1f}%")
    
    # Calculate detection metrics
    if num_sybils > 0:
        detection_rate = (num_sybils_greylisted / num_sybils) * 100
        print(f"Sybil detection rate: {detection_rate:.1f}%")
    
    # Calculate false positive rate (honest nodes greylisted)
    num_honest_greylisted = num_greylisted - num_sybils_greylisted
    if num_honest > 0:
        false_positive_rate = (num_honest_greylisted / num_honest) * 100
        print(f"False positive rate: {false_positive_rate:.2f}%")

if __name__ == "__main__":
    start_time = time.time()
    run_antigaming_simulation()
    print(f"\nSimulation completed in {time.time() - start_time:.2f} seconds")