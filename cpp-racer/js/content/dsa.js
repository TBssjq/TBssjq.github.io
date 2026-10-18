/** 数据结构与算法 */
export const CATEGORY = { id: 'dsa', name: { zh: '数据结构与算法', en: 'Data Structures & Algorithms' } };

export const TOPICS = [
  {
    id: 'dsa-array',
    cat: 'dsa',
    title: { zh: '数组与动态数组', en: 'Arrays & Dynamic Arrays' },
    meta: { zh: '连续内存 · O(1) 随机访问 · 均摊 O(1) 追加', en: 'contiguous · O(1) access · amortized O(1) push' },
    body: {
      zh: '数组把元素放在连续内存里，`v[i]` 只是「起始地址 + i × 元素大小」，所以是 O(1)。容量不够时 `vector` 会另开一块更大的内存并搬移旧元素，单次扩容 O(n)，但均摊到每次 `push_back` 仍是 O(1)。在中间插入或删除要整体搬移，是 O(n)。',
      en: 'An array keeps elements in contiguous memory, so `v[i]` is just base + i × sizeof(T): O(1). When capacity runs out, `vector` allocates a bigger block and moves everything; a single growth is O(n), yet amortized `push_back` stays O(1). Inserting or erasing in the middle shifts elements and costs O(n).',
    },
    code: `std::vector<int> v{3, 1, 4, 1, 5};

v.push_back(9);           // amortized O(1), may reallocate
v.insert(v.begin(), 0);   // O(n): everything shifts right

int x = v[2];             // O(1) random access
std::cout << v.size() << ' ' << v.capacity() << '\\n';

// After reallocation every pointer / iterator / reference is invalidated.`,
    points: {
      zh: ['默认选 vector，除非你有明确理由', '扩容会让旧迭代器失效，循环里别缓存 end()'],
      en: ['Default to vector unless you have a reason not to', 'Growth invalidates iterators — do not cache end() in a loop'],
    },
  },
  {
    id: 'dsa-linked-list',
    cat: 'dsa',
    title: { zh: '链表：指针串起来的节点', en: 'Linked Lists: Nodes and Pointers' },
    meta: { zh: '插入删除 O(1) · 随机访问 O(n) · 缓存不友好', en: 'O(1) insert/erase · O(n) access · cache unfriendly' },
    body: {
      zh: '每个节点单独分配，用指针串起来。已知位置时插入、删除都是 O(1)，但想找第 i 个元素只能从头走，是 O(n)，而且每次跳指针都可能 cache miss。面试高频题：反转链表、快慢指针找中点/判环、合并两个有序链表。',
      en: 'Each node is allocated separately and linked by pointers. Given a position, insert and erase are O(1); reaching the i-th element still walks from the head in O(n), and every hop can miss the cache. Classic exercises: reversing a list, fast/slow pointers for the middle or cycle detection, merging two sorted lists.',
    },
    code: `struct Node {
    int val;
    Node* next;
};

Node* push_front(Node* head, int v) {
    return new Node{v, head};          // O(1)
}

for (Node* p = head; p != nullptr; p = p->next)
    std::cout << p->val << ' ';

// std::list<T> does the memory management for you;
// prefer a vector for sequential scans.`,
    points: {
      zh: ['链表胜在「已知位置」的增删，不在遍历', '现代 C++ 用 std::list 或 unique_ptr 管节点，别手写 delete'],
      en: ['Lists win on insert/erase at a known node, not on traversal', 'Prefer std::list or unique_ptr over manual new/delete'],
    },
  },
  {
    id: 'dsa-hash',
    cat: 'dsa',
    title: { zh: '哈希表：用空间换时间', en: 'Hash Tables: Trading Space for Time' },
    meta: { zh: '平均 O(1) · 最坏 O(n) · rehash 让迭代器失效', en: 'average O(1) · worst O(n) · rehash invalidates iterators' },
    body: {
      zh: '哈希函数把 key 映射到桶下标，冲突用链地址法或开放寻址解决。桶够分散时查找/插入是 O(1)；一旦大量冲突就退化成 O(n)。元素变多会触发 rehash（扩容重排），此时所有迭代器失效。需要有序遍历时改用 `map` / `set`。',
      en: 'A hash function maps a key to a bucket index; collisions are handled by chaining or open addressing. With well-spread buckets, lookup and insert are O(1); heavy collisions degrade to O(n). Growth triggers a rehash that invalidates all iterators. Need ordering? Use `map` / `set` instead.',
    },
    code: `std::unordered_map<std::string, int> age;

age["ada"] = 36;                        // average O(1)
age.insert({"linus", 55});

if (auto it = age.find("ada"); it != age.end())
    std::cout << it->second << '\\n';

age.reserve(1024);                      // avoid repeated rehashing
// worst case O(n) when many keys collide`,
    points: {
      zh: ['自定义类型做 key 要提供 hash 与相等比较', '遍历顺序不保证稳定，需要有序就用 map'],
      en: ['Custom keys need a hash and an equality predicate', 'Iteration order is unspecified — use map when order matters'],
    },
  },
  {
    id: 'dsa-tree',
    cat: 'dsa',
    title: { zh: '二叉树与二叉搜索树', en: 'Binary Trees & BSTs' },
    meta: { zh: '平衡时 O(log n) · 中序有序 · 退化 O(n)', en: 'O(log n) balanced · inorder sorted · O(n) degenerate' },
    body: {
      zh: '二叉搜索树满足「左子树 < 根 < 右子树」，查找、插入、删除在平衡时是 O(log n)，中序遍历天然得到有序序列。如果插入顺序单调，树会退化成链表变成 O(n)，所以标准库的 `map` / `set` 用红黑树来保证对数复杂度。',
      en: 'A BST keeps left subtree < node < right subtree, giving O(log n) search, insert and erase when balanced, and an inorder walk yields sorted output. Monotonic insertion degenerates the tree into a list and O(n); that is why the standard `map` / `set` use a red-black tree.',
    },
    code: `struct Node {
    int key;
    Node* left = nullptr;
    Node* right = nullptr;
};

void inorder(const Node* n) {           // sorted output for a BST
    if (!n) return;
    inorder(n->left);
    std::cout << n->key << ' ';
    inorder(n->right);
}

int height(const Node* n) {
    return n ? 1 + std::max(height(n->left), height(n->right)) : 0;
}`,
    points: {
      zh: ['递归遍历写法短，但深度大时会爆栈', '工程里直接用 map / set / priority_queue，别手写平衡树'],
      en: ['Recursive traversals are short but can overflow the stack', 'In practice use map / set / priority_queue, not a hand-rolled balanced tree'],
    },
  },
];
