# Markdown Assistant 示例文档

这是一个示例文档，展示了Markdown Assistant的各种功能。

## 三种编辑模式

- **WYSIWYG**: 所见即所得模式，适合普通用户
- **IR**: 即时渲染模式，适合开发者
- **SV**: 分屏预览模式，传统编辑体验

## 数学公式 (LaTeX)

行内公式：$E = mc^2$

块级公式：

$$
\frac{\partial f}{\partial x} = 2\sqrt{a}x
$$

矩阵示例：

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## Mermaid 图表

### 流程图

```mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D
```

### 甘特图

```mermaid
gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 设计
    需求分析           :done,    des1, 2024-01-01,2024-01-05
    系统设计           :active,  des2, 2024-01-06, 5d
    section 开发
    前端开发           :         a1, after des2, 7d
    后端开发           :         a2, after des2, 10d
    section 测试
    单元测试           :         b1, after a1, 3d
    集成测试           :         b2, after a2, 3d
```

### 时序图

```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库
    
    用户->>前端: 点击登录
    前端->>后端: 发送登录请求
    后端->>数据库: 查询用户信息
    数据库-->>后端: 返回用户数据
    后端-->>前端: 返回登录结果
    前端-->>用户: 显示登录成功
```

## 代码块高亮

### JavaScript

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return {
        message: 'Welcome',
        timestamp: Date.now()
    };
}

// 调用函数
greet('World');
```

### Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算斐波那契数列
for i in range(10):
    print(fibonacci(i))
```

### Rust

```rust
fn main() {
    let message = String::from("Hello, Tauri!");
    println!("{}", message);
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
```

## 表格

| 功能 | WYSIWYG | IR | SV |
|------|---------|----|----|
| 所见即所得 | ✅ | ❌ | ❌ |
| 即时渲染 | ❌ | ✅ | ✅ |
| 分屏预览 | ❌ | ❌ | ✅ |
| 适合用户 | 普通用户 | 开发者 | 全部 |

## 其他Markdown功能

### 引用

> 这是一段引用文本
> 
> 可以包含多行
> > 嵌套引用也支持

### 列表

无序列表：
- 项目一
- 项目二
  - 子项目 A
  - 子项目 B
- 项目三

有序列表：
1. 第一步
2. 第二步
3. 第三步

任务列表：
- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成任务

### 文字格式

**粗体文字**

*斜体文字*

~~删除线~~

`行内代码`

### 链接和图片

[访问Vditor官网](https://b3log.org/vditor/)

---

享受使用Markdown Assistant！
