/** 面向对象 */
export const CATEGORY = { id: 'oop', name: { zh: '面向对象', en: 'Object-Oriented' } };

export const TOPICS = [
  {
    id: 'oop-encapsulation',
    cat: 'oop',
    title: { zh: '封装与访问控制', en: 'Encapsulation & Access Control' },
    meta: { zh: 'class vs struct · public/private · 不变式', en: 'class vs struct · access levels · invariants' },
    body: {
      zh: '封装的目的是维护「不变式」：对象对外只暴露不会破坏内部状态的接口。`class` 默认 private，`struct` 默认 public，这只影响默认值。习惯上：纯数据聚合用 `struct`，有不变式要守护的用 `class`，并把数据成员设为 private。',
      en: 'Encapsulation exists to preserve invariants: expose only operations that cannot corrupt the object state. `class` defaults to private, `struct` to public — that is the only difference. Convention: `struct` for plain data aggregates, `class` with private members when there is an invariant to protect.',
    },
    code: `class Account {
public:
    explicit Account(double initial) : balance_(initial) {}

    void deposit(double amount) {
        if (amount <= 0) throw std::invalid_argument("amount");
        balance_ += amount;                 // invariant: balance_ >= 0
    }

    double balance() const noexcept { return balance_; }

private:
    double balance_ = 0;                    // hidden state
};

struct Point { double x = 0, y = 0; };      // plain data`,
    points: {
      zh: ['先想清楚不变式，再决定哪些接口必须存在', 'getter/setter 不是封装，把行为放进去才有意义'],
      en: ['Define the invariant first, then the minimal interface', 'Getters alone are not encapsulation — put behavior inside'],
    },
  },
  {
    id: 'oop-polymorphism',
    cat: 'oop',
    title: { zh: '虚函数与运行时多态', en: 'Virtual Functions & Runtime Polymorphism' },
    meta: { zh: 'vtable · override · 抽象接口', en: 'vtable · override · abstract interface' },
    body: {
      zh: '基类把函数声明为 `virtual`，调用时根据对象的动态类型选实现，而不是看指针的静态类型。实现机制通常是虚函数表（vtable），每个对象存一个指向表的指针，因此有一次间接调用开销。加 `override` 让编译器帮你检查签名，加 `= 0` 变成纯虚接口。',
      en: 'Mark a base-class function `virtual` and the call resolves on the dynamic type of the object, not the static type of the pointer. The usual implementation is a vtable per class plus a hidden pointer per object, adding one indirection. Use `override` so the compiler checks the signature, and `= 0` for a pure interface.',
    },
    code: `class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;        // pure virtual
    virtual const char* name() const { return "shape"; }
};

class Circle final : public Shape {
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return 3.14159265 * r_ * r_; }
    const char* name() const override { return "circle"; }
private:
    double r_;
};

std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(1.0));
for (const auto& s : shapes) std::cout << s->name() << ' ' << s->area();`,
    points: {
      zh: ['多态调用只发生在指针或引用上，按值传参会切片', '接口类必须有虚析构，否则 delete 基类指针会泄漏'],
      en: ['Polymorphism works through pointers or references — by-value copies slice', 'Interfaces need a virtual destructor or deleting through the base leaks'],
    },
  },
  {
    id: 'oop-slicing',
    cat: 'oop',
    title: { zh: '对象切片与虚析构陷阱', en: 'Object Slicing & Virtual Destructors' },
    meta: { zh: '按值传递 · delete 基类 · 未定义行为', en: 'pass by value · delete via base · undefined behavior' },
    body: {
      zh: '把派生类对象赋给基类对象（按值）时，只有基类子对象被拷贝，派生部分被「切掉」，虚函数也不再动态绑定。同理，通过基类指针 `delete` 一个派生对象，如果基类析构不是 virtual，就是未定义行为。这两个坑在代码评审里出现频率极高。',
      en: 'Assigning a derived object to a base object by value copies only the base subobject — the derived part is sliced off and virtual dispatch is gone. Likewise, deleting a derived object through a base pointer is undefined behavior unless the base destructor is virtual. Both bugs show up constantly in code review.',
    },
    code: `struct Base { virtual ~Base() = default; virtual void hi() const {} };
struct Derived : Base { void hi() const override {} std::string extra; };

Derived d;
Base sliced = d;          // slicing: "extra" is gone
Base& ref    = d;         // fine: still polymorphic
Base* ptr    = &d;        // fine

void take(Base b);        // takes a copy -> slicing
void take(const Base& b); // correct

Base* p = new Derived;
delete p;                 // OK only because ~Base is virtual`,
    points: {
      zh: ['多态对象一律用引用或（智能）指针传递', '基类析构函数写 virtual ~Base() = default; 成本极低'],
      en: ['Pass polymorphic objects by reference or smart pointer', 'Always declare `virtual ~Base() = default;`'],
    },
  },
  {
    id: 'oop-composition',
    cat: 'oop',
    title: { zh: '组合优于继承', en: 'Composition over Inheritance' },
    meta: { zh: 'has-a vs is-a · 依赖倒置 · 策略模式', en: 'has-a vs is-a · dependency inversion · strategy' },
    body: {
      zh: '继承表达 is-a，组合表达 has-a。继承会把派生类永久绑定到基类实现上，基类一改全部受影响；组合只依赖接口，可以在运行时替换。SOLID 里的「开闭原则」「依赖倒置」基本都在说这件事：面向接口编程，而不是面向具体类。',
      en: 'Inheritance models is-a; composition models has-a. Inheritance permanently couples a derived class to the base implementation, so any base change ripples outward; composition depends only on an interface and can be swapped at runtime. The open/closed and dependency-inversion principles both say: program to an interface, not a concrete class.',
    },
    code: `struct Encoder {                       // interface
    virtual ~Encoder() = default;
    virtual std::string encode(std::string_view) const = 0;
};

struct JsonEncoder : Encoder {
    std::string encode(std::string_view s) const override { return "{\\"v\\":\\"" + std::string(s) + "\\"}"; }
};

class Logger {                          // has-a, not is-a
public:
    explicit Logger(const Encoder& enc) : enc_(enc) {}
    void write(std::string_view msg) { std::cout << enc_.encode(msg) << '\\n'; }
private:
    const Encoder& enc_;
};

JsonEncoder json;
Logger log(json);                       // inject the behavior`,
    points: {
      zh: ['只有当派生类真的能替换基类（LSP）时才用继承', '优先注入接口，让测试可以塞假实现'],
      en: ['Inherit only when the derived type truly substitutes the base (LSP)', 'Inject interfaces so tests can plug in fakes'],
    },
  },
];
