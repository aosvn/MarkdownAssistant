# Mermaid 流程图示例

本文件包含 Markdown Assistant 中使用的各种 Mermaid 流程图示例。

---

## 1. 整体应用工作流

```mermaid
flowchart TD
    Start([启动应用]) --> Init[初始化Vditor编辑器]
    Init --> Load{是否有未保存文件?}
    Load -->|是| ShowLast[显示上次编辑内容]
    Load -->|否| ShowEmpty[显示空白编辑器]
    ShowLast --> EditLoop
    ShowEmpty --> EditLoop
    
    subgraph EditLoop [编辑循环]
        direction TB
        Edit[用户编辑内容] --> CheckSave{需要保存?}
        CheckSave -->|是| SaveFile[保存文件]
        CheckSave -->|否| CheckMode{切换模式?}
        SaveFile --> CheckMode
        CheckMode -->|是| SwitchMode[切换编辑模式]
        CheckMode -->|否| CheckClose{关闭应用?}
        SwitchMode --> CheckClose
        CheckClose -->|否| Edit
    end
    
    CheckClose -->|是| CheckModified{文件已修改?}
    CheckModified -->|是| ShowConfirm[显示确认对话框]
    CheckModified -->|否| Exit([退出应用])
    ShowConfirm -->{确认退出?}
    -->|是| Exit
    -->|否| Edit
```

---

## 2. 三种编辑模式对比

```mermaid
flowchart LR
    subgraph WYSIWYG [WYSIWYG模式]
        W1[直接看到最终效果]
        W2[类似Word体验]
        W3[无需Markdown语法]
    end
    
    subgraph IR [IR模式]
        I1[输入后立即渲染]
        I2[类似Typora体验]
        I3[兼顾编辑和预览]
    end
    
    subgraph SV [SV模式]
        S1[左侧编辑右侧预览]
        S2[传统Markdown体验]
        S3[完全控制语法]
    end
    
    User([用户]) --> WYSIWYG
    User --> IR
    User --> SV
    
    WYSIWYG --> Common[通用功能<br/>数学公式<br/>Mermaid图表<br/>代码高亮]
    IR --> Common
    SV --> Common
```

---

## 3. 新建文件流程

```mermaid
flowchart TD
    ClickNew([点击新建按钮]) --> Check{当前文件已修改?}
    Check -->|是| ShowConfirm[显示确认对话框]
    ShowConfirm -->{确认继续?}
    -->|否| Cancel([取消操作])
    -->|是| Clear[清空编辑器]
    Check -->|否| Clear
    Clear --> ResetPath[重置文件路径]
    ResetPath --> UpdateName[更新文件名显示]
    UpdateName --> ClearFlag[清除修改标志]
    ClearFlag --> Done([完成，可以开始编辑])
```

---

## 4. 打开文件流程

```mermaid
flowchart TD
    ClickOpen([点击打开按钮]) --> CheckModified{当前文件已修改?}
    CheckModified -->|是| ShowConfirm[显示确认对话框]
    ShowConfirm -->{确认继续?}
    -->|否| Cancel([取消操作])
    -->|是| ShowDialog
    CheckModified -->|否| ShowDialog[显示文件选择对话框]
    
    ShowDialog --> SelectFile{用户选择文件?}
    SelectFile -->|否| Cancel
    SelectFile -->|是| ReadFile[读取文件内容]
    
    ReadFile --> Success{读取成功?}
    Success -->|否| ShowError[显示错误消息]
    ShowError --> Done([操作结束])
    Success -->|是| SetContent[设置编辑器内容]
    
    SetContent --> SavePath[保存文件路径]
    SavePath --> ExtractName[提取文件名]
    ExtractName --> UpdateDisplay[更新文件名显示]
    UpdateDisplay --> ClearFlag[清除修改标志]
    ClearFlag --> OpenDone([文件打开成功])
```

---

## 5. 保存文件流程

```mermaid
flowchart TD
    ClickSave([点击保存按钮]) --> HasPath{已有文件路径?}
    HasPath -->|否| CallSaveAs[调用另存为]
    CallSaveAs --> SaveAsFlow[另存为流程]
    HasPath -->|是| GetContent[获取编辑器内容]
    
    GetContent --> WriteFile[写入文件系统]
    WriteFile --> Success{写入成功?}
    Success -->|否| ShowError[显示错误消息]
    ShowError --> SaveFail([保存失败])
    Success -->|是| ClearFlag[清除修改标志]
    ClearFlag --> ShowSuccess[显示成功消息]
    ShowSuccess --> SaveDone([保存成功])
    
    subgraph SaveAsFlow [另存为流程]
        direction TB
        ShowSaveDialog[显示保存对话框] --> SelectPath{选择路径?}
        SelectPath -->|否| CancelSave([取消])
        SelectPath -->|是| GetContent2[获取编辑器内容]
        GetContent2 --> WriteFile2[写入文件]
        WriteFile2 --> SaveResult{成功?}
        SaveResult -->|否| ShowError2[显示错误]
        SaveResult -->|是| SavePath2[保存新路径]
        SavePath2 --> UpdateName2[更新文件名]
        UpdateName2 --> ClearFlag2[清除修改标志]
        ClearFlag2 --> ShowSuccess2[显示成功]
    end
```

---

## 6. 模式切换详细流程

```mermaid
flowchart TD
    ClickMode([点击模式按钮]) --> GetMode[获取目标模式]
    GetMode --> CheckCurrent{当前有实例?}
    CheckCurrent -->|是| TryGetValue[try获取当前内容]
    TryGetValue --> GetSuccess{获取成功?}
    GetSuccess -->|是| SaveContent[保存内容]
    GetSuccess -->|否| WarnGet[警告:获取内容失败]
    WarnGet --> ClearContent[清空内容变量]
    SaveContent --> TryDestroy
    ClearContent --> TryDestroy[try销毁实例]
    
    TryDestroy --> DestroySuccess{销毁成功?}
    DestroySuccess -->|否| WarnDestroy[警告:销毁失败]
    DestroySuccess -->|是| SetNull[设置vditor=null]
    WarnDestroy --> SetNull
    CheckCurrent -->|否| ClearContainer
    
    SetNull --> ClearContainer[清空容器HTML]
    ClearContainer --> CreateNew[创建新Vditor实例]
    CreateNew --> Config[配置选项]
    Config --> AfterCallback[after回调触发]
    AfterCallback --> UpdateButtons[更新按钮状态]
    UpdateButtons --> HasSaved{有保存的内容?}
    HasSaved -->|是| Restore[恢复内容]
    HasSaved -->|否| Complete([切换完成])
    Restore --> Complete
```

---

## 7. 窗口关闭处理流程

```mermaid
flowchart TD
    UserClose([用户点击关闭按钮]) --> Trigger[触发onCloseRequested事件]
    Trigger --> CheckModified{文件已修改?}
    CheckModified -->|否| AllowClose([允许关闭])
    CheckModified -->|是| Prevent[preventDefault阻止默认关闭]
    Prevent --> ShowConfirm[显示确认对话框]
    ShowConfirm --> WaitUser[等待用户确认]
    WaitUser --> UserChoice{用户选择?}
    UserChoice -->|确认| DoClose[调用appWindow.close]
    UserChoice -->|取消| Resume([继续编辑])
    DoClose --> CloseApp([应用关闭])
```

---

## 8. 系统架构分层

```mermaid
flowchart TB
    subgraph 用户界面层
        UI1[工具栏按钮]
        UI2[编辑器区域]
        UI3[模式切换]
    end
    
    subgraph 业务逻辑层
        BL1[文件操作模块]
        BL2[编辑器管理模块]
        BL3[状态管理模块]
    end
    
    subgraph Tauri API层
        TA1[对话框API]
        TA2[文件系统API]
        TA3[窗口API]
    end
    
    subgraph 系统层
        S1[文件系统]
        S2[窗口管理器]
    end
    
    UI1 --> BL1
    UI2 --> BL2
    UI3 --> BL2
    BL1 --> TA1
    BL1 --> TA2
    BL2 --> TA3
    BL3 --> BL1
    BL3 --> BL2
    TA1 --> S2
    TA2 --> S1
    TA3 --> S2
```

---

## 9. 初始化流程

```mermaid
flowchart TD
    AppStart([应用启动]) --> LoadHTML[加载index.html]
    LoadHTML --> LoadCSS[加载样式文件]
    LoadCSS --> LoadJS[加载main.js]
    LoadJS --> DOMReady[DOMContentLoaded事件]
    DOMReady --> InitVditor[调用initVditor'sv']
    InitVditor --> CreateInstance[创建Vditor实例]
    CreateInstance --> ConfigOptions[配置所有选项]
    ConfigOptions --> AfterEvent[after回调执行]
    AfterEvent --> UpdateBtn[更新按钮状态]
    UpdateBtn --> BindEvents[绑定事件监听器]
    BindEvents --> Ready([应用就绪])
```

---

## 10. 内容修改检测

```mermaid
flowchart TD
    UserInput([用户输入内容]) --> TriggerInput[触发input事件]
    TriggerInput --> CallSetMod[调用setModified true]
    CallSetMod --> SetVar[设置isModified=true]
    SetVar --> GetIndicator[获取modifiedIndicator元素]
    GetIndicator --> RemoveHidden[移除hidden类]
    RemoveHidden --> ShowStar[显示*号]
    ShowStar --> Done([修改标志已更新])
```

---

## 11. 键盘快捷键处理

```mermaid
flowchart TD
    KeyDown([按键按下]) --> CheckCtrl{Ctrl/Cmd按下?}
    CheckCtrl -->|否| Ignore([忽略])
    CheckCtrl -->|是| CheckKey{检查按键}
    
    CheckKey -->|S| CheckShift{Shift按下?}
    CheckShift -->|是| SaveAs([执行另存为])
    CheckShift -->|否| Save([执行保存])
    
    CheckKey -->|N| NewFile([执行新建])
    CheckKey -->|O| OpenFile([执行打开])
    CheckKey -->|其他| Ignore
```

---

## 12. Mermaid 图表渲染流程

```mermaid
flowchart TD
    UserWrite([用户编写Mermaid代码]) --> InputEvent[触发输入事件]
    InputEvent --> VditorParse[Vditor解析Markdown]
    VditorParse --> DetectMermaid{检测到mermaid代码块?}
    DetectMermaid -->|否| ContinueRender[继续渲染其他内容]
    DetectMermaid -->|是| ExtractCode[提取Mermaid代码]
    ExtractCode --> MermaidInit[初始化Mermaid]
    MermaidInit --> ParseDiagram[解析图表语法]
    ParseDiagram --> Valid{语法正确?}
    Valid -->|否| ShowError[显示错误提示]
    Valid -->|是| RenderSVG[渲染为SVG]
    RenderSVG --> InsertDOM[插入到DOM]
    InsertDOM --> ContinueRender
```

---

## 使用说明

以上所有流程图都可以直接在 Markdown Assistant 中渲染显示。只需将代码块复制到编辑器中，选择包含 Mermaid 支持的编辑模式即可查看效果。

### 基本语法

```mermaid
flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D
```

### 节点类型

- `[文本]` - 矩形节点
- `([文本])` - 圆角矩形（开始/结束）
- `{文本}` - 菱形（判断）
- `[[文本]]` - 子程序
- `[(文本)]` - 数据库

### 连线方向

- `TD` - 从上到下
- `LR` - 从左到右
- `TB` - 从上到下（同TD）
- `BT` - 从下到上
- `RL` - 从右到左
