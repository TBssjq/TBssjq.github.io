/** STL 标准库 */
export const CATEGORY = { id: 'stl', name: { zh: 'STL 标准库', en: 'The STL' } };

export const TOPICS = [
  {
    id: 'stl-container',
    cat: 'stl',
    title: { zh: '容器总览：怎么选', en: 'Picking a Container' },
    meta: { zh: '访问方式 · 有序性 · 插入位置', en: 'access pattern · ordering · insertion point' },
    body: {
      zh: '选容器看三件事：要不要随机访问、要不要有序、主要在哪插入。`vector` 连续、缓存友好，是默认答案；`deque` 两端都 O(1)；`list` 只在已知位置增删时有优势；`map` / `set` 有序但每个节点单独分配；`unordered_*` 用哈希换常数时间；`array` 定长且可以放在栈上。',
      en: 'Choose by three questions: random access, ordering, and where you insert. `vector` is contiguous and cache friendly — the default. `deque` is O(1) at both ends. `list` only wins when inserting/erasing at a known node. `map` / `set` are ordered but node-based. `unordered_*` trades hashing for constant time. `array` is fixed-size and can live on the stack.',
    },
    code: `std::vector<int> v{1, 2, 3};       // contiguous, random access
std::deque<int>  dq{1, 2, 3};      // O(1) push/pop at both ends
std::list<int>   ls{1, 2, 3};      // doubly linked

std::map<std::string, int>        ordered;   // red-black tree
std::unordered_map<std::string,int> hashed;  // hash table

std::array<int, 3> a{1, 2, 3};     // no heap allocation
std::set<int> s{3, 1, 2};          // sorted, unique`,
    points: {
      zh: ['先用 vector，性能不够再换', '需要「按键有序遍历」才用 map，否则 unordered_map 更快'],
      en: ['Start with vector; change only when measured', 'Use map only when ordered iteration matters'],
    },
  },
  {
    id: 'stl-iterator',
    cat: 'stl',
    title: { zh: '迭代器：容器与算法的胶水', en: 'Iterators: Glue Between Containers and Algorithms' },
    meta: { zh: '五个类别 · 失效规则 · erase 返回下一个', en: 'five categories · invalidation · erase returns next' },
    body: {
      zh: '算法不认容器，只认迭代器。`sort` 需要随机访问迭代器，所以 `list` 用不了，只能用成员 `sort()`。迭代器分输入、前向、双向、随机访问等类别，能力逐级增强。记住失效规则：`vector` 扩容后全部失效；`map` 只有被删的那个失效；`erase` 返回下一个有效位置。',
      en: 'Algorithms know nothing about containers, only iterators. `sort` needs random access, so `list` cannot use it and provides a member `sort()`. Iterator categories (input, forward, bidirectional, random access) describe increasing power. Remember invalidation: `vector` growth invalidates all; `map` only invalidates the erased node; `erase` returns the next valid iterator.',
    },
    code: `std::vector<int> v{1, 2, 3, 4};

for (auto it = v.begin(); it != v.end(); ++it)
    *it *= 2;

for (int x : v) std::cout << x << ' ';   // range-for

auto it = std::find(v.begin(), v.end(), 6);
if (it != v.end()) v.erase(it);          // erase returns next

// NEVER keep an iterator across push_back on a vector.`,
    points: {
      zh: ['能用范围 for 就别手写下标', 'erase 时用 `it = v.erase(it)` 的写法避免越界'],
      en: ['Prefer range-for over manual index loops', 'Use `it = v.erase(it)` to stay valid'],
    },
  },
  {
    id: 'stl-algorithm',
    cat: 'stl',
    title: { zh: '<algorithm>：别手写循环', en: '<algorithm>: Stop Writing Loops' },
    meta: { zh: 'sort · lower_bound · erase-remove', en: 'sort · lower_bound · erase-remove' },
    body: {
      zh: '标准算法用迭代器区间表达「在哪里做」，比手写 for 更短也更难写错。`sort` 是内省排序，平均 O(n log n)；`lower_bound` 在有序区间做二分；删除元素要用 erase-remove 惯用法，因为 `remove` 只是把要保留的元素前移。',
      en: 'Standard algorithms take an iterator range, so they are shorter and harder to get wrong than hand-written loops. `sort` is introsort, O(n log n) on average; `lower_bound` binary-searches a sorted range; erasing uses the erase-remove idiom because `remove` only shifts survivors forward.',
    },
    code: `std::vector<int> v{5, 2, 8, 1, 9};

std::sort(v.begin(), v.end());                        // O(n log n)
bool has8 = std::binary_search(v.begin(), v.end(), 8);

auto it = std::lower_bound(v.begin(), v.end(), 5);    // first >= 5
std::cout << std::distance(v.begin(), it) << '\\n';

v.erase(std::remove_if(v.begin(), v.end(),
        [](int x) { return x % 2 == 0; }), v.end());

int total = std::accumulate(v.begin(), v.end(), 0);`,
    points: {
      zh: ['先排序再二分，别在无序区间 binary_search', 'remove 不改变 size，必须配合 erase'],
      en: ['Sort before binary_search', 'remove does not shrink the container — always erase'],
    },
  },
  {
    id: 'stl-adapter',
    cat: 'stl',
    title: { zh: '容器适配器：stack / queue / heap', en: 'Adapters: stack, queue, priority_queue' },
    meta: { zh: '受限接口 · 默认底层容器 · 自定义比较', en: 'restricted API · default backend · custom compare' },
    body: {
      zh: '适配器不提供迭代器，只暴露必要的操作，逼你用对数据结构。`stack` 与 `queue` 默认基于 `deque`；`priority_queue` 是二叉堆，默认大根堆，取最大值 O(1)、插入 O(log n)。要小根堆就给它 `std::greater<>`。',
      en: 'Adapters expose no iterators and only the operations you should need, which keeps you honest. `stack` and `queue` default to `deque`; `priority_queue` is a binary heap, a max-heap by default: top is O(1), push/pop O(log n). Pass `std::greater<>` for a min-heap.',
    },
    code: `std::stack<int> st;                // LIFO
st.push(1); st.push(2);
int top = st.top(); st.pop();

std::queue<int> q;                 // FIFO
q.push(1); q.push(2);
int front = q.front(); q.pop();

std::priority_queue<int> maxHeap;  // largest on top
maxHeap.push(3); maxHeap.push(7);
std::cout << maxHeap.top();        // 7

std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;`,
    points: {
      zh: ['需要遍历就别用适配器', '自定义类型进 priority_queue 要提供 operator< 或比较器'],
      en: ['Do not use an adapter if you need iteration', 'Custom types need operator< or a comparator for priority_queue'],
    },
  },
];
