/** 泛型编程 */
export const CATEGORY = { id: 'generic', name: { zh: '泛型编程', en: 'Generic Programming' } };

export const TOPICS = [
  {
    id: 'gen-template',
    cat: 'generic',
    title: { zh: '函数模板与类模板', en: 'Function & Class Templates' },
    meta: { zh: '编译期实例化 · 类型推导 · 非类型参数', en: 'instantiation · deduction · non-type parameters' },
    body: {
      zh: '模板不是运行时的「泛型」，而是编译期的代码生成器：每种实际类型都会实例化出一份真正的函数或类。所以模板实现必须放在头文件里。除了类型参数，还能用非类型参数（整数、枚举、指针）在编译期确定大小，`std::array` 就是这么做的。',
      en: 'Templates are not runtime generics — they are compile-time code generators: every concrete type instantiates a real function or class, which is why implementations live in headers. Besides type parameters you can pass non-type parameters (integers, enums, pointers) to fix sizes at compile time, exactly like `std::array`.',
    },
    code: `template <class T>
T maxOf(const T& a, const T& b) { return a < b ? b : a; }

template <class T, std::size_t N>
struct Array {
    T data[N];
    constexpr std::size_t size() const { return N; }
    T& operator[](std::size_t i) { return data[i]; }
};

Array<int, 4> a{};                       // size fixed at compile time
auto m = maxOf(3, 7);                    // T deduced as int
auto n = maxOf<double>(3, 7.5);          // force T = double`,
    points: {
      zh: ['推导只在参数上发生，返回值不会帮你推导', '模板错误发生在实例化时，报错长是正常的'],
      en: ['Deduction happens on parameters, not return types', 'Template errors surface at instantiation — long messages are normal'],
    },
  },
  {
    id: 'gen-specialization',
    cat: 'generic',
    title: { zh: '特化与 type traits', en: 'Specialization & Type Traits' },
    meta: { zh: '全特化 · 偏特化 · 编译期分支', en: 'full · partial · compile-time branching' },
    body: {
      zh: '特化让某个具体类型走另一套实现。全特化把参数全部写死，偏特化只固定一部分（例如所有指针类型）。标准库的 `type_traits` 就是这样实现的：`is_pointer<T>` 默认 false，对 `T*` 偏特化为 true。C++17 之后很多场景可以用 `if constexpr` 代替。',
      en: 'Specialization gives one concrete type a different implementation. Full specialization pins every argument; partial specialization pins some (for example all pointer types). The standard `type_traits` are built this way: `is_pointer<T>` is false by default and true for `T*`. Since C++17, `if constexpr` replaces many of these tricks.',
    },
    code: `template <class T>
struct is_pointer { static constexpr bool value = false; };

template <class T>
struct is_pointer<T*> { static constexpr bool value = true; };   // partial

static_assert(is_pointer<int*>::value);
static_assert(!is_pointer<int>::value);

template <>
struct is_pointer<void> { static constexpr bool value = false; }; // full

// modern alternative
template <class T>
constexpr bool is_ptr_v = std::is_pointer_v<T>;`,
    points: {
      zh: ['特化必须出现在使用之前，通常紧跟在主模板后', '能用 constexpr / concepts 表达就别堆 traits'],
      en: ['Specializations must be visible before use', 'Prefer constexpr or concepts over stacked traits'],
    },
  },
  {
    id: 'gen-variadic',
    cat: 'generic',
    title: { zh: '可变参数模板与折叠表达式', en: 'Variadic Templates & Fold Expressions' },
    meta: { zh: '参数包 · sizeof... · C++17 折叠', en: 'parameter pack · sizeof... · C++17 folds' },
    body: {
      zh: '`class... Ts` 是类型参数包，`Ts... args` 是函数参数包。C++11 靠递归逐个展开，C++17 的折叠表达式一行就能把所有参数用同一个运算符串起来。`std::forward<Ts>(args)...` 配合 `Ts&&...` 就是完美转发，`emplace_back` 就靠它。',
      en: '`class... Ts` is a type parameter pack and `Ts... args` a function parameter pack. C++11 expanded them recursively; C++17 fold expressions combine every argument with one operator in a single line. Pair `Ts&&...` with `std::forward<Ts>(args)...` for perfect forwarding — that is how `emplace_back` works.',
    },
    code: `template <class... Ts>
auto sum(Ts... xs) { return (xs + ... + 0); }     // fold, C++17

template <class... Ts>
void print(const Ts&... xs) {
    ((std::cout << xs << ' '), ...);
    std::cout << "\\n(count: " << sizeof...(xs) << ")\\n";
}

template <class T, class... Args>
auto make(Args&&... args) {
    return T(std::forward<Args>(args)...);        // perfect forwarding
}

print(1, 2.5, "hi");`,
    points: {
      zh: ['参数包只能用 sizeof... 取个数，不能下标访问', '完美转发时引用折叠：T&& + & 得到 &'],
      en: ['Packs have no indexing — only sizeof...', 'Reference collapsing makes T&& + & become &'],
    },
  },
  {
    id: 'gen-concepts',
    cat: 'generic',
    title: { zh: 'concepts：给模板加约束', en: 'concepts: Constraining Templates' },
    meta: { zh: 'C++20 · requires 表达式 · 更好的报错', en: 'C++20 · requires expressions · better errors' },
    body: {
      zh: '没有约束的模板对参数「照单全收」，错误要等到实例化深处才炸，报错动辄几百行。C++20 的 `concept` 把要求写成可检查的表达式，不满足时在调用点直接报错。它取代了大部分 SFINAE 技巧，也让重载选择更清晰。',
      en: 'An unconstrained template accepts anything and only explodes deep inside instantiation, with hundreds of lines of errors. C++20 `concept`s state the requirements as checkable expressions, so violations are reported at the call site. They replace most SFINAE tricks and make overload resolution readable.',
    },
    code: `template <class T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::convertible_to<T>;
    { a += b } -> std::same_as<T&>;
};

template <Addable T>
T add(T a, T b) { return a + b; }

// shorthand form
void scale(std::integral auto x) { /* ... */ }

static_assert(Addable<int>);
static_assert(Addable<std::string>);
static_assert(!Addable<std::vector<int>>);   // no operator+`,
    points: {
      zh: ['用现成的 std::integral / std::ranges::range 等标准 concept', 'requires 里只检查「能不能编译」，不检查语义'],
      en: ['Reuse standard concepts: std::integral, std::ranges::range, ...', 'requires checks well-formedness, not semantics'],
    },
  },
];
