/** 现代 C++ */
export const CATEGORY = { id: 'modern', name: { zh: '现代 C++', en: 'Modern C++' } };

export const TOPICS = [
  {
    id: 'modern-auto',
    cat: 'modern',
    title: { zh: 'auto、范围 for 与结构化绑定', en: 'auto, Range-for & Structured Bindings' },
    meta: { zh: '少写类型 · 注意引用与拷贝', en: 'less typing · watch references vs copies' },
    body: {
      zh: '`auto` 让编译器推导类型，但推导规则和模板一样：`auto` 会丢掉引用和 const，所以要按需写 `auto&`、`const auto&`、`auto&&`。范围 for 遍历时默认按值拷贝，遍历大对象要写 `const auto&`。结构化绑定能一次拆开 pair / tuple / 结构体。',
      en: '`auto` deduces like a template: it drops references and top-level const, so choose `auto&`, `const auto&` or `auto&&` deliberately. Range-for copies by default — write `const auto&` for heavy elements. Structured bindings unpack pairs, tuples and aggregates in one line.',
    },
    code: `std::map<std::string, int> m{{"a", 1}, {"b", 2}};

for (const auto& [key, value] : m)        // no copies
    std::cout << key << '=' << value << '\\n';

auto it = m.find("a");                    // iterator
auto n  = m.size();                       // std::size_t

if (auto [pos, ok] = m.try_emplace("c", 3); ok)
    std::cout << "inserted\\n";

for (auto&& x : container) { /* binds to anything */ }`,
    points: {
      zh: ['`auto x = expr` 永远拷贝一份，除非表达式本身就是引用', '别用 auto 藏住重要类型（比如把 int 隐式变成 double）'],
      en: ['`auto x = expr` always makes a copy', 'Do not let auto hide a meaningful conversion'],
    },
  },
  {
    id: 'modern-smart-ptr',
    cat: 'modern',
    title: { zh: '智能指针与所有权模型', en: 'Smart Pointers & Ownership' },
    meta: { zh: 'unique · shared · weak', en: 'unique · shared · weak' },
    body: {
      zh: '`unique_ptr` 独占所有权，零额外开销，只能移动；`shared_ptr` 共享所有权，靠引用计数，计数是原子的所以有成本；`weak_ptr` 不增加计数，用来观察 shared 对象并打破循环引用。默认用 unique，需要共享时才升级，永远优先 `make_unique` / `make_shared`。',
      en: '`unique_ptr` owns exclusively with zero overhead and is move-only. `shared_ptr` shares ownership through an atomic reference count, which costs something. `weak_ptr` observes without owning and breaks cycles. Default to unique, upgrade only when sharing is real, and always create with `make_unique` / `make_shared`.',
    },
    code: `auto p = std::make_unique<int>(42);        // exclusive
auto q = std::make_shared<int>(7);         // shared, ref-counted
std::weak_ptr<int> w = q;                  // does not add to the count

if (auto sp = w.lock())                    // promote while in use
    std::cout << *sp << '\\n';

struct Node {
    std::vector<std::shared_ptr<Node>> children;
    std::weak_ptr<Node> parent;            // breaks the cycle
};

// make_* is exception safe: no leak if the constructor throws.`,
    points: {
      zh: ['传参用 `T*` 或 `T&` 表示「不接管所有权」', 'shared_ptr 的计数操作有原子开销，热路径别乱用'],
      en: ['Pass `T*` or `T&` to mean "no ownership transfer"', 'Ref-counting is atomic — avoid shared_ptr in hot paths'],
    },
  },
  {
    id: 'modern-lambda',
    cat: 'modern',
    title: { zh: 'lambda 与捕获', en: 'Lambdas & Captures' },
    meta: { zh: '按值 / 按引用 / 初始化捕获', en: 'by value / by reference / init capture' },
    body: {
      zh: 'lambda 是编译器生成的一个函数对象（闭包），捕获列表决定它持有什么。`[=]` 按值、`[&]` 按引用、`[x, &y]` 混合。按引用捕获要小心生命周期：如果 lambda 活得比变量久，就会悬垂。C++14 起支持初始化捕获 `[n = 0]` 和泛型参数 `auto`。',
      en: 'A lambda is a compiler-generated function object (closure); the capture list decides what it holds. `[=]` copies, `[&]` references, `[x, &y]` mixes. Watch lifetimes with reference captures: a lambda that outlives the variable dangles. Since C++14 you can init-capture `[n = 0]` and use generic `auto` parameters.',
    },
    code: `int base = 10;
auto add  = [base](int x) { return base + x; };   // copy
auto bump = [&base]() { ++base; };                // reference

std::vector<int> v{3, 1, 2};
std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

auto counter = [n = 0]() mutable { return n++; };  // stateful
counter(); counter();                              // 0, 1

auto twice = [](auto x) { return x + x; };         // generic lambda`,
    points: {
      zh: ['`[&]` 全部按引用最容易踩悬垂，异步回调尤其危险', '需要保存的 lambda 用 `std::function` 或 `auto`，注意拷贝成本'],
      en: ['`[&]` is the easiest way to dangle, especially in async callbacks', 'Store lambdas in `auto` or `std::function` — mind copy cost'],
    },
  },
  {
    id: 'modern-optional',
    cat: 'modern',
    title: { zh: 'optional / variant / string_view', en: 'optional, variant & string_view' },
    meta: { zh: '表达「可能没有」· 类型安全联合 · 零拷贝视图', en: 'maybe-empty · type-safe union · zero-copy view' },
    body: {
      zh: '`optional<T>` 明确表达「可能没有值」，比返回 -1 或空指针更安全；`variant<A,B>` 是类型安全的 union，用 `visit` 分派；`string_view` 是「指针 + 长度」的只读视图，不拥有内存，所以绝不能指向已经销毁的临时字符串。',
      en: '`optional<T>` states "maybe no value" more safely than -1 or a null pointer. `variant<A,B>` is a type-safe union dispatched with `visit`. `string_view` is a non-owning pointer+length view, so it must never point at a destroyed temporary.',
    },
    code: `std::optional<int> parse(std::string_view s) {
    try { return std::stoi(std::string(s)); }
    catch (...) { return std::nullopt; }
}

if (auto v = parse("42")) std::cout << *v << '\\n';

std::variant<int, std::string> v = "hello";
std::cout << std::get<std::string>(v) << '\\n';
std::visit([](const auto& x) { std::cout << x; }, v);

std::string_view sv = "no allocation";     // careful with lifetimes`,
    points: {
      zh: ['optional 有存储开销（bool + T），不要嵌套 optional', 'string_view 不保证以 \\0 结尾，别直接传给 C API'],
      en: ['optional costs a flag — never nest optionals', 'string_view is not null-terminated — convert before C APIs'],
    },
  },
  {
    id: 'modern-ranges',
    cat: 'modern',
    title: { zh: 'ranges 与惰性视图', en: 'Ranges & Lazy Views' },
    meta: { zh: 'C++20 · 管道 · 惰性求值', en: 'C++20 · pipelines · lazy evaluation' },
    body: {
      zh: '`ranges` 把「区间」提升为一等概念，算法可以直接接容器。`views` 是惰性的：`filter`、`transform`、`take` 组合起来不会立刻计算，也不会拷贝元素，只有遍历时才逐个求值。用管道符 `|` 串起来，读起来像数据流。',
      en: '`ranges` promote a range to a first-class concept so algorithms accept containers directly. `views` are lazy: chaining `filter`, `transform` and `take` computes nothing immediately and copies nothing; values are produced during iteration. The `|` pipeline reads like a data flow.',
    },
    code: `std::vector<int> v{1, 2, 3, 4, 5, 6};

auto even = v | std::views::filter([](int x) { return x % 2 == 0; })
              | std::views::transform([](int x) { return x * x; })
              | std::views::take(2);

for (int x : even) std::cout << x << ' ';    // 4 16

auto total = std::ranges::fold_left(v, 0, std::plus<>{});  // C++23
std::ranges::sort(v);                        // no begin/end needed`,
    points: {
      zh: ['view 不拥有数据，底层容器销毁后不能再用', '需要物化结果时用 `std::ranges::to<std::vector>()`（C++23）'],
      en: ['Views do not own data — never outlive the underlying container', 'Materialize with `std::ranges::to<std::vector>()` (C++23)'],
    },
  },
];
