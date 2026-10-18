/** C++ 语言机制与特有特性 */
export const CATEGORY = { id: 'lang', name: { zh: '语言机制', en: 'Language Mechanics' } };

export const TOPICS = [
  {
    id: 'lang-pointer',
    cat: 'lang',
    title: { zh: '指针、引用与所有权', en: 'Pointers, References & Ownership' },
    meta: { zh: '可空 · 可重绑 · 别名', en: 'nullable · rebindable · alias' },
    body: {
      zh: '指针是一个存放地址的值：可以为空、可以改指向、可以做算术，也可能悬垂。引用是已有对象的别名：必须初始化、不能换绑、没有空引用。现代 C++ 的规矩是「用引用表达必不为空，用智能指针表达所有权，裸指针只做观察者」。',
      en: 'A pointer is a value holding an address: nullable, rebindable, arithmetic-capable, and possibly dangling. A reference is an alias to an existing object: must be initialized, cannot be reseated, and is never null. Modern C++ says: references for "never null", smart pointers for ownership, raw pointers only as non-owning observers.',
    },
    code: `int  x = 42;
int* p = &x;        // p holds the address of x
*p = 7;             // write through the pointer

int& r = x;         // alias, must be bound at birth
r = 9;              // x is now 9

void render(const std::vector<int>& data);  // read-only, no copy
void render(const std::vector<int>* data);  // pointer: may be null

int* bad() { int local = 1; return &local; } // dangling!`,
    points: {
      zh: ['引用不占「独立对象」的语义，编译器通常直接当别名', '函数参数：大对象用 const&，可能缺省用指针或 optional'],
      en: ['References are aliases — the compiler rarely materializes them', 'Parameters: const& for big read-only objects, pointer/optional when absent is valid'],
    },
  },
  {
    id: 'lang-raii',
    cat: 'lang',
    title: { zh: 'RAII：让析构函数干活', en: 'RAII: Let Destructors Do the Work' },
    meta: { zh: '构造获取 · 析构释放 · 异常安全', en: 'acquire in ctor · release in dtor · exception safe' },
    body: {
      zh: 'RAII 是 C++ 最重要的惯用法：把资源（内存、文件、锁、socket）绑定到对象生命周期上，构造时获取、析构时释放。这样无论正常返回、提前 return 还是抛异常，栈展开都会调用析构函数，资源一定归还。`unique_ptr`、`lock_guard`、`fstream` 都是它的实例。',
      en: 'RAII is the most important C++ idiom: tie a resource (memory, file, lock, socket) to an object lifetime — acquire in the constructor, release in the destructor. Normal return, early return or an exception all unwind the stack and run the destructor, so the resource is always released. `unique_ptr`, `lock_guard` and `fstream` are all RAII.',
    },
    code: `class File {
public:
    explicit File(const char* path) : fp_(std::fopen(path, "r")) {}
    ~File() { if (fp_) std::fclose(fp_); }

    File(const File&) = delete;             // no copies
    File& operator=(const File&) = delete;

    std::FILE* get() const { return fp_; }
private:
    std::FILE* fp_;
};

void read() {
    File f("data.txt");   // released even if we throw below
    if (!f.get()) throw std::runtime_error("open failed");
}`,
    points: {
      zh: ['不要手写 new/delete，除非你在写容器或底层库', '析构函数里不要抛异常，默认 noexcept'],
      en: ['Avoid manual new/delete outside containers or low-level code', 'Destructors must not throw — they are noexcept by default'],
    },
  },
  {
    id: 'lang-copy-move',
    cat: 'lang',
    title: { zh: '拷贝、移动与五法则', en: 'Copy, Move & the Rule of Five' },
    meta: { zh: '深拷贝 · 转移所有权 · copy-and-swap', en: 'deep copy · ownership transfer · copy-and-swap' },
    body: {
      zh: '拷贝构造复制资源，移动构造「偷走」资源并把源对象置空。编译器生成的移动是逐成员移动；一旦你自己写了析构、拷贝或移动中的任何一个，其余几个就不会自动生成，这就是五法则。移动构造记得标 `noexcept`，否则 `vector` 扩容时不敢用它。',
      en: 'A copy constructor duplicates the resource; a move constructor steals it and leaves the source empty. Compiler-generated moves are member-wise. Once you declare a destructor, copy or move operation, the others stop being generated — that is the rule of five. Mark moves `noexcept`, otherwise `vector` growth will not use them.',
    },
    code: `class Buffer {
public:
    explicit Buffer(std::size_t n) : p_(new int[n]()), n_(n) {}
    ~Buffer() { delete[] p_; }

    Buffer(const Buffer& o)                       // deep copy
        : p_(new int[o.n_]), n_(o.n_) {
        std::copy(o.p_, o.p_ + n_, p_);
    }

    Buffer(Buffer&& o) noexcept                   // steal
        : p_(o.p_), n_(o.n_) { o.p_ = nullptr; o.n_ = 0; }

    Buffer& operator=(Buffer o) { swap(o); return *this; }  // copy-and-swap
    void swap(Buffer& o) noexcept { std::swap(p_, o.p_); std::swap(n_, o.n_); }

private:
    int* p_;
    std::size_t n_;
};`,
    points: {
      zh: ['移动后源对象必须处于「有效但未指定」状态', '能遵循零法则（用成员管理资源）就别手写五法则'],
      en: ['A moved-from object must stay valid but unspecified', 'Prefer the rule of zero: let members manage resources'],
    },
  },
  {
    id: 'lang-constexpr',
    cat: 'lang',
    title: { zh: 'const 正确性与编译期计算', en: 'const Correctness & Compile-Time Computation' },
    meta: { zh: '接口契约 · constexpr · if constexpr', en: 'interface contract · constexpr · if constexpr' },
    body: {
      zh: '`const` 是写给调用者的契约：这个函数不会改对象状态。成员函数加 `const` 才能被 const 对象调用，也才能接收临时对象。`constexpr` 把计算搬到编译期，`consteval` 强制编译期，`if constexpr` 在模板里按条件丢弃分支。',
      en: '`const` is a contract with the caller: this function will not mutate the object. A member function must be `const` to be callable on a const object and to accept temporaries. `constexpr` moves computation to compile time, `consteval` forces it, and `if constexpr` discards branches in templates.',
    },
    code: `constexpr int square(int x) { return x * x; }
constexpr int N = square(8);        // computed at compile time

const int* p;                       // pointer to const int
int* const q = nullptr;             // const pointer
const int* const r = nullptr;       // both

class Vec {
public:
    int size() const noexcept { return n_; }   // const member
private:
    int n_ = 0;
};

template <class T>
void dump(const T& v) {
    if constexpr (std::is_pointer_v<T>) std::cout << *v;
    else std::cout << v;
}`,
    points: {
      zh: ['成员函数默认该是 const，除非它真的改状态', 'constexpr 函数也能在运行时调用，不必二选一'],
      en: ['Make member functions const unless they truly mutate', 'A constexpr function still runs at runtime when needed'],
    },
  },
];
