import "./style.css";

const QUESTION_TEMPLATES = {
  template1: "template1 - 普通折叠 FAQ",
  template3: "template3 - 静态说明卡片",
  template4: "template4 - 静态标题块",
  template5: "template5 - 步骤手风琴",
  template6: "template6 - 新版分组步骤手风琴",
};

const ANSWER_TEMPLATES = {
  template1: "template1 - HTML 内容",
  template3: "template3 - 步骤图片列表",
  template4: "template4 - 图片步骤切换器",
  template5: "template5 - 静态图片教程网格",
  template6: "template6 - 排错表格",
  template7: "template7 - 四角边框提示框",
  template8: "template8 - 图文并排提示",
  template9: "template9 - 均高图片教程网格",
};

let appMode = "single";
let state = createInitialState();
let multiState = createFaqSampleState();
let selectedQuestionIndex = 0;
const collapsedCards = new Set();
const expandedCardsByScope = new Map();

document.querySelector("#app").innerHTML = `
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <h1>FAQ JSON 生成器</h1>
        <p>支持单条 question JSON，也支持 main-faq-list 使用的完整 FAQ JSON。</p>
      </div>
      <div class="top-actions">
        <button id="singleModeBtn" type="button">单条问题</button>
        <button id="faqModeBtn" type="button">完整 FAQ</button>
        <button id="sampleBtn" type="button">填充示例</button>
        <button id="importJsonBtn" type="button">导入 JSON</button>
        <button id="resetBtn" type="button">重置</button>
        <button id="generateBtn" class="primary" type="button">一键生成 JSON</button>
      </div>
    </header>

    <section class="workspace">
      <article class="panel">
        <div class="panel-header">
          <h2>内容编辑</h2>
          <span class="helper">HTML 字段会原样写入 JSON，不做清洗或转换。</span>
        </div>
        <div id="formRoot" class="panel-body"></div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h2>预览与 JSON</h2>
          <span class="helper">预览为本地模拟，用于检查内容结构。</span>
        </div>
        <div class="panel-body preview-panel">
          <div id="previewRoot"></div>
          <label>
            生成结果
            <textarea id="outputJson" class="output" spellcheck="false" readonly></textarea>
          </label>
        </div>
      </article>
    </section>

    <footer id="status" class="status"><strong>Ready</strong></footer>
  </main>
`;

const formRoot = document.querySelector("#formRoot");
const previewRoot = document.querySelector("#previewRoot");
const outputJson = document.querySelector("#outputJson");
const statusEl = document.querySelector("#status");

function createInitialState() {
  return {
    title: "What is Backup & Restore?",
    questionTemplate: "template1",
    headerType: "",
    link: "",
    answers: [
      {
        answerTemplate: "template1",
        content:
          "<p class='marginBottom32'><span style='color: #e83633'>A backup</span> is a saved copy of your OpenClaw agent’s previous state.</p>",
      },
    ],
  };
}

function createSampleState() {
  return {
    title: "Step 3: Create OAuth Client (PC)",
    questionTemplate: "template6",
    headerType: "stepHeader",
    link: "",
    answers: [
      {
        title: "",
        contents: [
          {
            answerTemplate: "template1",
            content: "<p class='marginBottom32'>Intro content for this step.</p>",
          },
          {
            answerTemplate: "template4",
            title: "3a. Configure Consent Screen",
            stepList: [
              {
                image: "https://cdn.shopify.com/s/files/1/0973/7499/4718/files/faq_step1.png",
                desc: "<p>Open the Google Cloud console.</p>",
              },
              {
                image: "https://cdn.shopify.com/s/files/1/0973/7499/4718/files/faq_step2.png",
                desc: "<p>Configure the consent screen.</p>",
              },
            ],
          },
        ],
      },
      {
        title: "3b. Add Test User",
        contents: [
          {
            answerTemplate: "template4",
            stepList: [
              {
                image: "https://cdn.shopify.com/s/files/1/0973/7499/4718/files/faq_step3.png",
                desc: "<p>Add your Google email as a test user.</p>",
              },
            ],
          },
        ],
      },
    ],
  };
}

function createFaqSampleState() {
  return {
    title: "Fix it when ClawGo gets it wrong",
    headerContent:
      "<p class='marginBottom16'>How to correct AI answers, ask follow-up questions, and guide ClawGo step by step</p><p>ClawGo may not always get everything right on the first try. That is normal. The fastest way to fix an answer is not to start over, but to tell ClawGo what is wrong, what the correct information is, and how you want the answer revised.</p>",
    questions: [
      {
        title: "1. Point out what is wrong",
        questionTemplate: "template1",
        answers: [
          {
            answerTemplate: "template1",
            content: "<p class='marginBottom16'>Be specific. ClawGo can improve much faster when it knows exactly which part needs to change.</p>",
          },
          {
            answerTemplate: "template6",
            headers: ["Instead of", "Try"],
            rows: [
              { columns: ["This is wrong.", "The deadline is wrong. The correct deadline is Friday."] },
              { columns: ["Try again.", "You missed the customer impact. Please add that and rewrite the summary."] },
            ],
          },
        ],
      },
      {
        title: "2. Give the correct information",
        questionTemplate: "template1",
        answers: [
          {
            answerTemplate: "template1",
            content:
              "<p class='marginBottom16'>If ClawGo used the wrong name, date, fact, audience, or context, correct it directly.</p><ul class='ulTemplate'><li class='marginBottom16'>The meeting is on Wednesday, not Monday. Please update the message.</li><li class='marginBottom16'>The audience is a customer, not an internal team. Make it more polished.</li><li class='marginBottom16'>This is about product feedback, not technical support. Please summarize it again with that context.</li></ul>",
          },
        ],
      },
      {
        title: "Remember",
        questionTemplate: "template3",
        answers: [
          {
            answerTemplate: "template1",
            content:
              "<p>ClawGo gets better when you guide it. If the first answer is not right, correct the mistake, add the missing context, and ask it to try again. Over time, ClawGo will better understand how you think, what you prefer, and how to help you more effectively.</p>",
          },
        ],
      },
    ],
  };
}

function defaultAnswerGroup(title = "New sub step") {
  return {
    title,
    contents: [defaultAnswer("template1")],
  };
}

function defaultAnswer(answerTemplate = "template1") {
  if (answerTemplate === "template1") {
    return { answerTemplate, content: "<p class='marginBottom16'>Your content here.</p>" };
  }
  if (answerTemplate === "template3") {
    return {
      answerTemplate,
      stepsPerRow: 4,
      stepList: [{ image: "", desc: "Tap the Menu icon in the upper-left corner." }],
    };
  }
  if (answerTemplate === "template4") {
    return {
      answerTemplate,
      title: "Step title",
      stepList: [{ image: "", desc: "<p>1. Describe this step.</p>" }],
    };
  }
  if (answerTemplate === "template5") {
    return {
      answerTemplate,
      stepList: [{ image: "", content: "<p>Describe this screenshot.</p>" }],
    };
  }
  if (answerTemplate === "template9") {
    return {
      answerTemplate,
      stepsPerRow: 2,
      stepList: [{ image: "", headerContent: "<p>Step title</p>", content: "<p>Describe this screenshot.</p>" }],
    };
  }
  if (answerTemplate === "template6") {
    return {
      answerTemplate,
      headers: ["Problem", "Cause", "Solution"],
      rows: [{ problem: "Problem", cause: "Cause", solution: "Solution" }],
    };
  }
  if (answerTemplate === "template8") {
    return {
      answerTemplate,
      content:
        "<p class='marginBottom32'><strong>Do This In Your ClawGo Chat:</strong></p><ul class='ulTemplate'><li class='marginBottom16'>Tell ClawGo: &quot;Connect WhatsApp&quot;</li><li class='marginBottom16'>ClawGo Will Generate A WhatsApp Linking QR Code.</li><li class='marginBottom16'>What You Should See: The QR Code Should Appear As An Actual Image In The Chat.</li></ul><p><strong>If You Don’t See The QR Code Sent By ClawGo, Feel Free To Give It A Little Push — Just Ask ClawGo To Send A Fresh One!</strong></p>",
      image: "",
      imageAlt: "ClawGo chat QR code",
    };
  }
  return {
    answerTemplate,
    content:
      "<p>I Want To <span>[Goal]</span>.</p><p>The Context Is <span>[Background]</span>.</p>",
  };
}

function render() {
  formRoot.innerHTML = "";
  syncStateFromMode();
  document.querySelector("#singleModeBtn").classList.toggle("primary", appMode === "single");
  document.querySelector("#faqModeBtn").classList.toggle("primary", appMode === "faq" || appMode === "faqDetail");
  if (appMode === "faq") {
    formRoot.append(renderFaqForm());
  } else if (appMode === "faqDetail") {
    formRoot.append(renderFaqDetailHeader(), renderQuestionForm(), renderAnswersForm());
  } else {
    formRoot.append(renderQuestionForm(), renderAnswersForm());
  }
  renderPreview();
  updateOutput(false);
}

function syncStateFromMode() {
  if (appMode !== "faq" && appMode !== "faqDetail") return;
  if (!multiState.questions.length) multiState.questions.push(createInitialState());
  selectedQuestionIndex = Math.min(selectedQuestionIndex, multiState.questions.length - 1);
  state = multiState.questions[selectedQuestionIndex];
}

function moveQuestion(fromIndex, targetIndex, position) {
  if (fromIndex < 0 || targetIndex < 0 || fromIndex >= multiState.questions.length || targetIndex >= multiState.questions.length) return;
  const selectedQuestion = multiState.questions[selectedQuestionIndex];
  const [draggedQuestion] = multiState.questions.splice(fromIndex, 1);
  let insertIndex = targetIndex + (position === "after" ? 1 : 0);
  if (fromIndex < insertIndex) insertIndex -= 1;
  multiState.questions.splice(insertIndex, 0, draggedQuestion);
  selectedQuestionIndex = Math.max(0, multiState.questions.indexOf(selectedQuestion));
  resetCollapseState();
  render();
  setStatus("问题顺序已更新。");
}

function renderFaqDetailHeader() {
  const section = document.createElement("section");
  section.className = "faq-builder";
  section.innerHTML = `
    <div class="answers-header">
      <h3>正在编辑：${escapeHtml(state.title || "Untitled")}</h3>
      <button class="small" data-back-faq type="button">返回完整 FAQ</button>
    </div>
    <p class="helper">当前修改会同步回完整 FAQ 的 questions[${selectedQuestionIndex}]，右侧生成结果仍为完整 FAQ JSON。</p>
  `;
  section.querySelector("[data-back-faq]").addEventListener("click", () => {
    appMode = "faq";
    resetCollapseState();
    render();
  });
  return section;
}

function renderFaqForm() {
  const section = document.createElement("section");
  section.className = "faq-builder";
  section.innerHTML = `
    <div class="answers-header">
      <h3>完整 FAQ 信息</h3>
      <button class="small primary" data-add-question type="button">新增问题</button>
    </div>
    <div class="form-grid">
      <label>
        FAQ 标题 title
        <input data-faq-title value="${escapeAttr(multiState.title || "")}" />
      </label>
    </div>
    <div class="question-list"></div>
  `;

  const formGrid = section.querySelector(".form-grid");
  const headerField = textareaField("headerContent", multiState.headerContent || "", value => {
    multiState.headerContent = value;
    refreshSide();
  }, { formatHtml: true });
  headerField.classList.add("full");
  formGrid.append(headerField);

  section.querySelector("[data-faq-title]").addEventListener("input", event => {
    multiState.title = event.target.value;
    refreshSide();
  });
  section.querySelector("[data-add-question]").addEventListener("click", () => {
    multiState.questions.push(createInitialState());
    selectedQuestionIndex = multiState.questions.length - 1;
    resetCollapseState();
    render();
  });

  const list = section.querySelector(".question-list");
  let dragFromIndex = null;
  let dropPosition = "after";

  const clearDragState = () => {
    list.querySelectorAll(".question-list-item").forEach(row => {
      row.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
    });
  };

  multiState.questions.forEach((question, index) => {
    const item = document.createElement("div");
    item.className = `question-list-item${index === selectedQuestionIndex ? " is-active" : ""}`;
    item.draggable = true;
    item.dataset.questionIndex = String(index);
    item.innerHTML = `
      <button class="small drag-handle" data-drag-question type="button" title="拖拽排序" aria-label="拖拽排序">↕</button>
      <button class="small" data-select-question type="button">${escapeHtml(question.title || "Untitled")}</button>
      <button class="small" data-duplicate-question type="button">复制</button>
      <button class="small danger" data-delete-question type="button">删除</button>
    `;
    item.addEventListener("dragstart", event => {
      dragFromIndex = index;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
      item.classList.add("is-dragging");
    });
    item.addEventListener("dragover", event => {
      event.preventDefault();
      if (dragFromIndex === null || dragFromIndex === index) return;
      const rect = item.getBoundingClientRect();
      dropPosition = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
      list.querySelectorAll(".question-list-item").forEach(row => {
        if (row !== item) row.classList.remove("is-drop-before", "is-drop-after");
      });
      item.classList.toggle("is-drop-before", dropPosition === "before");
      item.classList.toggle("is-drop-after", dropPosition === "after");
      event.dataTransfer.dropEffect = "move";
    });
    item.addEventListener("dragleave", event => {
      if (item.contains(event.relatedTarget)) return;
      item.classList.remove("is-drop-before", "is-drop-after");
    });
    item.addEventListener("drop", event => {
      event.preventDefault();
      const fromIndex = dragFromIndex ?? Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isInteger(fromIndex) || fromIndex === index) {
        clearDragState();
        return;
      }
      moveQuestion(fromIndex, index, dropPosition);
    });
    item.addEventListener("dragend", clearDragState);
    item.querySelector("[data-select-question]").addEventListener("click", () => {
      selectedQuestionIndex = index;
      appMode = "faqDetail";
      resetCollapseState();
      render();
    });
    item.querySelector("[data-duplicate-question]").addEventListener("click", () => {
      multiState.questions.splice(index + 1, 0, structuredClone(question));
      selectedQuestionIndex = index + 1;
      resetCollapseState();
      render();
    });
    item.querySelector("[data-delete-question]").addEventListener("click", () => {
      multiState.questions.splice(index, 1);
      selectedQuestionIndex = Math.max(0, index - 1);
      resetCollapseState();
      render();
    });
    list.append(item);
  });
  return section;
}

function renderQuestionForm() {
  const section = document.createElement("section");
  section.className = "form-grid";
  section.innerHTML = `
    <label>
      问题模板
      <select data-field="questionTemplate">
        ${optionsHtml(QUESTION_TEMPLATES, state.questionTemplate)}
      </select>
    </label>
    <label>
      标题
      <input data-field="title" value="${escapeAttr(state.title)}" placeholder="FAQ title" />
    </label>
    <label>
      headerType
      <select data-field="headerType">
        <option value="" ${state.headerType ? "" : "selected"}>不使用</option>
        <option value="stepHeader" ${state.headerType === "stepHeader" ? "selected" : ""}>stepHeader</option>
      </select>
    </label>
    <label>
      link
      <input data-field="link" value="${escapeAttr(state.link)}" placeholder="/pages/faq?type=..." />
    </label>
    <p class="helper full">template4 只输出标题和 questionTemplate；link 有值时预览为跳转项，生成 JSON 仍保留 link。</p>
  `;

  section.querySelectorAll("[data-field]").forEach(input => {
    input.addEventListener("input", () => {
      state[input.dataset.field] = input.value;
      if (input.dataset.field === "questionTemplate" && input.value === "template4") {
        state.answers = [];
        state.headerType = "";
        state.link = "";
        render();
        return;
      }
      if (input.dataset.field === "questionTemplate" && input.value === "template6") {
        state.link = "";
        if (!state.answers[0]?.contents) state.answers = [defaultAnswerGroup("")];
        render();
        return;
      }
      if (input.dataset.field === "questionTemplate" && input.value !== "template6" && state.answers[0]?.contents) {
        state.answers = [defaultAnswer("template1")];
        render();
        return;
      }
      if (input.dataset.field === "questionTemplate") render();
      else refreshSide();
    });
  });

  return section;
}

function renderAnswersForm() {
  if (state.questionTemplate === "template6") return renderAnswerGroupsForm();

  const wrapper = document.createElement("section");
  const disabled = state.questionTemplate === "template4";
  wrapper.innerHTML = `
    <div class="answers-header">
      <h3>答案模板</h3>
      <button id="addAnswerBtn" class="small primary" type="button" ${disabled ? "disabled" : ""}>新增答案</button>
    </div>
  `;

  const addButton = wrapper.querySelector("#addAnswerBtn");
  addButton?.addEventListener("click", () => {
    state.answers.push(defaultAnswer("template1"));
    render();
  });

  if (disabled) {
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = "template4 是静态标题块，不需要 answers。";
    wrapper.append(note);
    return wrapper;
  }

  state.answers.forEach((answer, index) => wrapper.append(renderAnswerCard(answer, index)));
  bindSortableCards(wrapper, ".answer-card", state.answers, "single-answer-cards");
  return wrapper;
}

function renderAnswerGroupsForm() {
  const wrapper = document.createElement("section");
  wrapper.innerHTML = `
    <div class="answers-header">
      <h3>步骤分组 contents</h3>
      <button id="addGroupBtn" class="small primary" type="button">新增分组</button>
    </div>
    <p class="helper">template6 使用 answers[].contents[]。第一组渲染在主展开区域，第二组及之后渲染为独立步骤卡片。</p>
  `;

  wrapper.querySelector("#addGroupBtn").addEventListener("click", () => {
    state.answers.push(defaultAnswerGroup(`Sub step ${state.answers.length + 1}`));
    render();
  });

  state.answers.forEach((group, groupIndex) => wrapper.append(renderAnswerGroupCard(group, groupIndex)));
  bindSortableCards(wrapper, ".answer-card", state.answers, "answer-groups");
  return wrapper;
}

function renderAnswerGroupCard(group, groupIndex) {
  const card = document.createElement("article");
  card.className = "answer-card";
  card.innerHTML = `
    <div class="answer-card-header">
      <div class="answer-title">
        <button class="small drag-handle" data-drag-card type="button" title="拖拽排序" aria-label="拖拽排序">↕</button>
        <span class="badge">Group ${groupIndex + 1}</span>
        <span>${groupIndex === 0 ? "主展开区域" : "独立步骤卡片"}</span>
      </div>
      <div class="card-actions">
        <button class="small danger" data-group-action="delete" type="button">删除</button>
      </div>
    </div>
    <div class="answer-card-body">
      <label>
        分组标题 title
        <input data-group-title value="${escapeAttr(group.title || "")}" placeholder="${groupIndex === 0 ? "第一组可留空" : "例如 3b. Add Test User"}" />
      </label>
      <div class="answers-header">
        <h3>contents</h3>
        <button class="small" data-add-content type="button">新增内容</button>
      </div>
    </div>
  `;

  card.querySelectorAll("[data-group-action]").forEach(button => {
    button.addEventListener("click", () => handleGroupAction(button.dataset.groupAction, groupIndex));
  });
  card.querySelector("[data-group-title]").addEventListener("input", event => {
    group.title = event.target.value;
    refreshSide();
  });
  card.querySelector("[data-add-content]").addEventListener("click", () => {
    group.contents = group.contents || [];
    group.contents.push(defaultAnswer("template1"));
    render();
  });

  const body = card.querySelector(".answer-card-body");
  (group.contents || []).forEach((content, contentIndex) => {
    body.append(renderContentCard(content, groupIndex, contentIndex));
  });
  bindCollapseButton(card, `group:${groupIndex}`);
  return card;
}

function renderContentCard(content, groupIndex, contentIndex) {
  const group = state.answers[groupIndex];
  const card = document.createElement("article");
  card.className = "sub-card";
  card.innerHTML = `
    <div class="sub-card-header">
      <strong>Content ${contentIndex + 1}</strong>
      <div class="card-actions">
        <button class="small" data-content-action="up" type="button">上移</button>
        <button class="small" data-content-action="down" type="button">下移</button>
        <button class="small danger" data-content-action="delete" type="button">删除</button>
      </div>
    </div>
    <div class="sub-card-body">
      <label>
        答案模板
        <select data-content-template>
          ${optionsHtml(ANSWER_TEMPLATES, content.answerTemplate)}
        </select>
      </label>
      <div data-content-body></div>
    </div>
  `;

  card.querySelector("[data-content-action='up']").disabled = contentIndex === 0;
  card.querySelector("[data-content-action='down']").disabled = contentIndex === (group.contents || []).length - 1;
  card.querySelectorAll("[data-content-action]").forEach(button => {
    button.addEventListener("click", () => handleNestedAction(group.contents, contentIndex, button.dataset.contentAction));
  });
  card.querySelector("[data-content-template]").addEventListener("input", event => {
    group.contents[contentIndex] = defaultAnswer(event.target.value);
    render();
  });
  card.querySelector("[data-content-body]").append(
    renderAnswerFieldsFor(content, patch => {
      Object.assign(content, patch);
      refreshSide();
    }, () => content, `group:${groupIndex}:content:${contentIndex}`)
  );
  bindCollapseButton(card, `group:${groupIndex}:content:${contentIndex}`);
  return card;
}

function renderAnswerCard(answer, index) {
  const card = document.createElement("article");
  card.className = "answer-card";
  card.innerHTML = `
    <div class="answer-card-header">
      <div class="answer-title">
        <button class="small drag-handle" data-drag-card type="button" title="拖拽排序" aria-label="拖拽排序">↕</button>
        <span class="badge">Answer ${index + 1}</span>
        <span>${ANSWER_TEMPLATES[answer.answerTemplate]}</span>
      </div>
      <div class="card-actions">
        <button class="small danger" data-action="delete" type="button">删除</button>
      </div>
    </div>
    <div class="answer-card-body">
      <label>
        答案模板
        <select data-answer-field="answerTemplate">
          ${optionsHtml(ANSWER_TEMPLATES, answer.answerTemplate)}
        </select>
      </label>
      <div data-answer-body></div>
    </div>
  `;

  card.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleAnswerAction(button.dataset.action, index));
  });

  card.querySelector("[data-answer-field='answerTemplate']").addEventListener("input", event => {
    state.answers[index] = defaultAnswer(event.target.value);
    render();
  });

  card.querySelector("[data-answer-body]").append(renderAnswerFields(answer, index));
  bindCollapseButton(card, `answer:${index}`, {
    defaultExpanded: index === 0,
    scope: "single-answer-cards",
  });
  return card;
}

function renderAnswerFields(answer, answerIndex) {
  return renderAnswerFieldsFor(answer, patch => updateAnswer(answerIndex, patch), () => state.answers[answerIndex], `answer:${answerIndex}`);
}

function renderAnswerFieldsFor(answer, onPatch, getAnswer, collapsePrefix = "answer") {
  const body = document.createElement("div");
  body.className = "answer-card-body";

  if (answer.answerTemplate === "template1" || answer.answerTemplate === "template7") {
    body.append(textareaField("HTML 内容", answer.content, value => onPatch({ content: value }), { formatHtml: true }));
  }

  if (answer.answerTemplate === "template8") {
    body.append(
      textareaField("HTML 内容 content", answer.content || "", value => onPatch({ content: value }), { formatHtml: true }),
      inputField("图片 URL image", answer.image || "", value => onPatch({ image: value })),
      inputField("图片描述 imageAlt", answer.imageAlt || "", value => onPatch({ imageAlt: value }))
    );
  }

  if (answer.answerTemplate === "template3") {
    const select = fieldWrapper("stepsPerRow", createSelect(["3", "4"], String(answer.stepsPerRow || 4), value =>
      onPatch({ stepsPerRow: Number(value) })
    ));
    body.append(select, renderStepListFor(getAnswer(), "desc", true, collapsePrefix));
  }

  if (answer.answerTemplate === "template4") {
    const supportsWrapperFields = state.questionTemplate === "template5" || state.questionTemplate === "template6";
    if (supportsWrapperFields) {
      body.append(
        inputField("外层步骤标题 title", answer.title || "", value => onPatch({ title: value })),
        textareaField("外层 HTML 内容 content", answer.content || "", value => onPatch({ content: value }), { formatHtml: true })
      );
    }
    body.append(renderStepListFor(getAnswer(), "desc", true, collapsePrefix));
  }

  if (answer.answerTemplate === "template5") {
    body.append(renderStepListFor(getAnswer(), "content", true, collapsePrefix));
  }

  if (answer.answerTemplate === "template9") {
    const select = fieldWrapper("stepsPerRow", createSelect(["2", "3"], String(answer.stepsPerRow || 2), value =>
      onPatch({ stepsPerRow: Number(value) })
    ));
    body.append(select, renderStepListFor(getAnswer(), "content", true, collapsePrefix));
  }

  if (answer.answerTemplate === "template6") {
    body.append(renderTableEditorFor(getAnswer(), collapsePrefix));
  }

  return body;
}

function renderStepListFor(answer, textKey, htmlText = false, collapsePrefix = "answer") {
  const stepList = answer.stepList || [];
  const wrapper = document.createElement("section");
  wrapper.innerHTML = `
    <div class="answers-header">
      <h3>步骤列表</h3>
      <button class="small" data-add-step type="button">新增步骤</button>
    </div>
  `;

  wrapper.querySelector("[data-add-step]").addEventListener("click", () => {
    answer.stepList = answer.stepList || [];
    const newStep = { image: "", [textKey]: htmlText ? "<p>Describe this step.</p>" : "Describe this step." };
    if (answer.answerTemplate === "template9") newStep.headerContent = "<p>Step title</p>";
    answer.stepList.push(newStep);
    render();
  });

  stepList.forEach((step, stepIndex) => {
    const item = document.createElement("article");
    item.className = "sub-card";
    item.innerHTML = `
      <div class="sub-card-header">
        <strong>Step ${stepIndex + 1}</strong>
        <div class="card-actions">
          <button class="small" data-step-action="up" type="button">上移</button>
          <button class="small" data-step-action="down" type="button">下移</button>
          <button class="small danger" data-step-action="delete" type="button">删除</button>
        </div>
      </div>
      <div class="sub-card-body"></div>
    `;

    item.querySelector("[data-step-action='up']").disabled = stepIndex === 0;
    item.querySelector("[data-step-action='down']").disabled = stepIndex === stepList.length - 1;
    item.querySelectorAll("[data-step-action]").forEach(button => {
      button.addEventListener("click", () => handleNestedAction(answer.stepList, stepIndex, button.dataset.stepAction));
    });

    item.querySelector(".sub-card-body").append(
      inputField("图片 URL", step.image || "", value => {
        step.image = value;
        refreshSide();
      }),
      ...(answer.answerTemplate === "template9"
        ? [
            textareaField("图片上方 HTML headerContent", step.headerContent || "", value => {
              step.headerContent = value;
              refreshSide();
            }, { formatHtml: true }),
          ]
        : []),
      textareaField(textKey === "content" ? "HTML 说明 content" : "说明 desc", step[textKey] || "", value => {
        step[textKey] = value;
        refreshSide();
      }, { formatHtml: htmlText })
    );
    bindCollapseButton(item, `${collapsePrefix}:step:${stepIndex}`);
    wrapper.append(item);
  });

  return wrapper;
}

function renderStepList(stepList = [], answerIndex, textKey, htmlText = false) {
  state.answers[answerIndex].stepList = stepList;
  return renderStepListFor(state.answers[answerIndex], textKey, htmlText);
}

function renderTableEditorFor(answer, collapsePrefix = "answer") {
  const wrapper = document.createElement("section");
  wrapper.innerHTML = `
    <label>
      表头 headers（用英文逗号分隔）
      <input data-headers value="${escapeAttr((answer.headers || []).join(", "))}" />
    </label>
    <label>
      行结构
      <select data-row-mode>
        <option value="default" ${usesColumns(answer) ? "" : "selected"}>problem / cause / solution</option>
        <option value="columns" ${usesColumns(answer) ? "selected" : ""}>columns 通用列</option>
      </select>
    </label>
    <div class="answers-header">
      <h3>表格行</h3>
      <button class="small" data-add-row type="button">新增行</button>
    </div>
  `;

  wrapper.querySelector("[data-headers]").addEventListener("change", event => {
    answer.headers = event.target.value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    render();
  });

  wrapper.querySelector("[data-row-mode]").addEventListener("input", event => {
    if (event.target.value === "columns") {
      answer.rows = [{ columns: answer.headers.map(header => header || "") }];
    } else {
      answer.headers = ["Problem", "Cause", "Solution"];
      answer.rows = [{ problem: "Problem", cause: "Cause", solution: "Solution" }];
    }
    render();
  });

  wrapper.querySelector("[data-add-row]").addEventListener("click", () => {
    if (usesColumns(answer)) answer.rows.push({ columns: answer.headers.map(() => "") });
    else answer.rows.push({ problem: "", cause: "", solution: "" });
    render();
  });

  answer.rows.forEach((row, rowIndex) => {
    const item = document.createElement("article");
    item.className = "sub-card";
    item.innerHTML = `
      <div class="sub-card-header">
        <strong>Row ${rowIndex + 1}</strong>
        <div class="card-actions">
          <button class="small" data-row-action="up" type="button">上移</button>
          <button class="small" data-row-action="down" type="button">下移</button>
          <button class="small danger" data-row-action="delete" type="button">删除</button>
        </div>
      </div>
      <div class="sub-card-body"></div>
    `;
    item.querySelector("[data-row-action='up']").disabled = rowIndex === 0;
    item.querySelector("[data-row-action='down']").disabled = rowIndex === answer.rows.length - 1;
    item.querySelectorAll("[data-row-action]").forEach(button => {
      button.addEventListener("click", () => handleNestedAction(answer.rows, rowIndex, button.dataset.rowAction));
    });

    const rowBody = item.querySelector(".sub-card-body");
    if (usesColumns(answer)) {
      answer.headers.forEach((header, columnIndex) => {
        row.columns[columnIndex] = row.columns[columnIndex] || "";
        rowBody.append(
        inputField(header || `Column ${columnIndex + 1}`, row.columns[columnIndex], value => {
          row.columns[columnIndex] = value;
          refreshSide();
        })
      );
      });
    } else {
      rowBody.append(
        inputField("problem", row.problem || "", value => {
          row.problem = value;
          refreshSide();
        }),
        inputField("cause", row.cause || "", value => {
          row.cause = value;
          refreshSide();
        }),
        inputField("solution", row.solution || "", value => {
          row.solution = value;
          refreshSide();
        })
      );
    }
    bindCollapseButton(item, `${collapsePrefix}:row:${rowIndex}`);
    wrapper.append(item);
  });

  return wrapper;
}

function renderTableEditor(answer, answerIndex) {
  state.answers[answerIndex] = answer;
  return renderTableEditorFor(answer, `answer:${answerIndex}`);
}

function renderPreview() {
  if (appMode === "faq") {
    renderFaqPreview();
    return;
  }
  const question = buildQuestion();
  const isStaticHeading = question.questionTemplate === "template4";
  const isLink = Boolean(question.link);
  const body = document.createElement("section");
  body.className = "clawgo-preview-stage main-faq-list-section";

  if (question.questionTemplate === "template3") {
    body.innerHTML = `
      <div class="question-template3">
        <div class="question-template3-title">${escapeHtml(question.title || "Untitled FAQ")}</div>
        <div class="question-template3-content"></div>
      </div>
    `;
    const content = body.querySelector(".question-template3-content");
    (question.answers || []).forEach(answer => content.append(renderAnswerPreview(answer)));
  } else if (isStaticHeading) {
    body.innerHTML = `<div class="question-template4">${escapeHtml(question.title || "Static Heading")}</div>`;
  } else if (question.questionTemplate === "template5") {
    body.append(renderStepAccordionPreview(question));
  } else if (question.questionTemplate === "template6") {
    body.append(renderGroupedStepAccordionPreview(question));
  } else {
    const item = document.createElement("details");
    item.className = `main-support-configurable__faq-item preview-card question-${question.questionTemplate}`;
    item.open = true;
    if (isLink) item.dataset.link = question.link;
    item.innerHTML = `
      <summary class="main-support-configurable__faq-toggle main-support-configurable__faq-toggle1">
        <h3 class="main-support-configurable__faq-toggle1-title">
          ${question.headerType === "stepHeader" ? trafficDotsHtml("main-support-configurable__faq-toggle1-title-icon") : ""}
          <span>${escapeHtml(question.title || "Untitled FAQ")}</span>
        </h3>
        ${toggleIconHtml("main-support-configurable__faq-toggle-icon", isLink ? "arrow" : "plus")}
      </summary>
    `;
    const content = document.createElement("div");
    content.className = "main-support-configurable__faq-content";
    if (isLink) {
      content.innerHTML = `<p class="faq-link-note">跳转链接：${escapeHtml(question.link)}</p>`;
    } else {
      (question.answers || []).forEach(answer => content.append(renderAnswerPreview(answer)));
    }
    item.append(content);
    body.append(item);
  }

  previewRoot.innerHTML = "";
  previewRoot.append(body);
  bindPreviewInteractions(body);
}

function renderFaqPreview() {
  const body = document.createElement("section");
  body.className = "clawgo-preview-stage main-faq-list-section";
  const header = document.createElement("div");
  header.className = "header-content";
  header.innerHTML = `<h1 class="title">${escapeHtml(multiState.title || "FAQ Title")}</h1>${normalizeHtmlForPreview(multiState.headerContent)}`;
  const list = document.createElement("div");
  list.className = "main-support-configurable__faq";

  let firstOpenFaqRendered = false;
  multiState.questions.forEach(question => {
    const holder = document.createElement("div");
    holder.className = "faq-preview-question";
    const previousMode = appMode;
    appMode = "single";
    const previousState = state;
    state = question;
    const fragment = document.createElement("div");
    const q = buildQuestion();
    if (q.questionTemplate === "template3") {
      fragment.innerHTML = `<div class="question-template3"><div class="question-template3-title">${escapeHtml(q.title || "Untitled FAQ")}</div><div class="question-template3-content"></div></div>`;
      (q.answers || []).forEach(answer => fragment.querySelector(".question-template3-content").append(renderAnswerPreview(answer)));
    } else if (q.questionTemplate === "template4") {
      fragment.innerHTML = `<div class="question-template4">${escapeHtml(q.title || "Static Heading")}</div>`;
    } else if (q.questionTemplate === "template5") {
      fragment.append(renderStepAccordionPreview(q));
    } else if (q.questionTemplate === "template6") {
      fragment.append(renderGroupedStepAccordionPreview(q));
    } else {
      const item = document.createElement("details");
      item.className = `main-support-configurable__faq-item preview-card question-${q.questionTemplate}`;
      item.open = !q.link && !firstOpenFaqRendered;
      if (!q.link && !firstOpenFaqRendered) firstOpenFaqRendered = true;
      if (q.link) item.dataset.link = q.link;
      item.innerHTML = `
        <summary class="main-support-configurable__faq-toggle main-support-configurable__faq-toggle1">
          <h3 class="main-support-configurable__faq-toggle1-title">
            ${q.headerType === "stepHeader" ? trafficDotsHtml("main-support-configurable__faq-toggle1-title-icon") : ""}
            <span>${escapeHtml(q.title || "Untitled FAQ")}</span>
          </h3>
          ${toggleIconHtml("main-support-configurable__faq-toggle-icon", q.link ? "arrow" : "plus")}
        </summary>
      `;
      if (!q.link) {
        const content = document.createElement("div");
        content.className = "main-support-configurable__faq-content";
        (q.answers || []).forEach(answer => content.append(renderAnswerPreview(answer)));
        item.append(content);
      }
      fragment.append(item);
    }
    state = previousState;
    appMode = previousMode;
    holder.append(...fragment.childNodes);
    list.append(holder);
  });

  body.append(header, list);
  previewRoot.innerHTML = "";
  previewRoot.append(body);
  bindPreviewInteractions(body);
}

function renderStepAccordionPreview(question) {
  const accordion = document.createElement("div");
  accordion.className = "main-faq-step-accordion fontSize22";
  accordion.dataset.faqStepAccordion = "";
  const template4Answers = (question.answers || []).filter(answer => answer.answerTemplate === "template4");
  const otherAnswers = (question.answers || []).filter(answer => answer.answerTemplate !== "template4");
  const primaryTemplate4 = template4Answers[0];
  accordion.innerHTML = `
    <div class="main-faq-step-accordion__main">
      <button class="main-faq-step-accordion__toggle" type="button" data-faq-step-accordion-toggle aria-expanded="false">
        <div class="main-faq-step-accordion__title">
          ${question.headerType === "stepHeader" ? trafficDotsHtml("main-faq-step-accordion__title-icon") : ""}
          <h3>${escapeHtml(question.title || "Step title")}</h3>
        </div>
        ${toggleIconHtml("main-faq-step-accordion__toggle-icon", "plus")}
      </button>
      <div class="main-faq-step-accordion__body" data-faq-step-accordion-body hidden></div>
    </div>
  `;

  const body = accordion.querySelector(".main-faq-step-accordion__body");

  otherAnswers.forEach(answer => {
    if (answer.answerTemplate === "template1") {
      const intro = document.createElement("div");
      intro.className = "main-faq-step-accordion__intro";
      intro.append(renderAnswerPreview(answer));
      body.append(intro);
      return;
    }

    const section = document.createElement("div");
    section.className = "main-faq-step-accordion__panel main-faq-step-accordion__panel--primary";
    section.append(renderAnswerPreview(answer));
    body.append(section);
  });

  if (primaryTemplate4) {
    const primary = document.createElement("div");
    primary.className = "main-faq-step-accordion__panel main-faq-step-accordion__panel--primary";
    primary.dataset.faqStepAccordionPanel = "";
    primary.innerHTML = `
      <button class="main-faq-step-accordion__panel-toggle" type="button" data-faq-step-accordion-panel-toggle aria-expanded="true">
        <span class="fontSize22">${escapeHtml(primaryTemplate4.title || "Step title")}</span>
      </button>
      <div class="main-faq-step-accordion__panel-body" data-faq-step-accordion-panel-body></div>
    `;
    primary.querySelector(".main-faq-step-accordion__panel-body").append(renderTemplate4Gallery(primaryTemplate4.stepList || []));
    body.append(primary);
  }

  template4Answers.slice(1).forEach(answer => {
    const panel = document.createElement("div");
    panel.className = "main-faq-step-accordion__panel main-faq-step-accordion__panel--framed";
    panel.dataset.faqStepAccordionPanel = "";
    panel.dataset.faqStepAccordionExtra = "";
    panel.hidden = true;
    panel.innerHTML = `
      <button class="main-faq-step-accordion__panel-toggle" type="button" data-faq-step-accordion-panel-toggle aria-expanded="true">
        <span class="fontSize22">${escapeHtml(answer.title || "Step title")}</span>
        ${toggleIconHtml("main-faq-step-accordion__panel-icon", "plus")}
      </button>
      <div class="main-faq-step-accordion__body">
        <div class="main-faq-step-accordion__panel-body" data-faq-step-accordion-panel-body></div>
      </div>
    `;
    panel.querySelector(".main-faq-step-accordion__panel-body").append(renderTemplate4Gallery(answer.stepList || []));
    accordion.append(panel);
  });

  return accordion;
}

function renderGroupedStepAccordionPreview(question) {
  const accordion = document.createElement("div");
  accordion.className = "main-faq-step-accordion fontSize22";
  accordion.dataset.faqStepAccordion = "";
  const groups = question.answers || [];
  const firstGroup = groups[0] || { title: "", contents: [] };
  accordion.innerHTML = `
    <div class="main-faq-step-accordion__main">
      <button class="main-faq-step-accordion__toggle" type="button" data-faq-step-accordion-toggle aria-expanded="false">
        <div class="main-faq-step-accordion__title">
          ${question.headerType === "stepHeader" ? trafficDotsHtml("main-faq-step-accordion__title-icon") : ""}
          <h3>${escapeHtml(question.title || "Step title")}</h3>
        </div>
        ${toggleIconHtml("main-faq-step-accordion__toggle-icon", "plus")}
      </button>
      <div class="main-faq-step-accordion__body" data-faq-step-accordion-body hidden></div>
    </div>
  `;

  const body = accordion.querySelector(".main-faq-step-accordion__body");
  (firstGroup.contents || []).forEach(content => body.append(renderGroupedContentPreview(content, firstGroup, true)));

  groups.slice(1).forEach(group => {
    const panel = document.createElement("div");
    panel.className = "main-faq-step-accordion__panel main-faq-step-accordion__panel--framed";
    panel.dataset.faqStepAccordionPanel = "";
    panel.dataset.faqStepAccordionExtra = "";
    panel.hidden = true;
    panel.innerHTML = `
      <button class="main-faq-step-accordion__panel-toggle" type="button" data-faq-step-accordion-panel-toggle aria-expanded="true">
        <span class="fontSize22">${escapeHtml(group.title || "Sub step")}</span>
        ${toggleIconHtml("main-faq-step-accordion__panel-icon", "plus")}
      </button>
      <div class="main-faq-step-accordion__body">
        <div class="main-faq-step-accordion__panel-body" data-faq-step-accordion-panel-body></div>
      </div>
    `;
    const panelBody = panel.querySelector(".main-faq-step-accordion__panel-body");
    (group.contents || []).forEach(content => panelBody.append(renderGroupedContentPreview(content, group, false)));
    accordion.append(panel);
  });

  return accordion;
}

function renderGroupedContentPreview(content, group, isFirstGroup) {
  if (content.answerTemplate === "template1") {
    const intro = document.createElement("div");
    intro.className = isFirstGroup ? "main-faq-step-accordion__intro" : "main-faq-step-accordion__panel-content";
    intro.innerHTML = content.content || "";
    return intro;
  }

  if (content.answerTemplate === "template4") {
    const panelTitle = content.title || group.title || "";
    const panel = document.createElement("div");
    panel.className = isFirstGroup
      ? "main-faq-step-accordion__panel main-faq-step-accordion__panel--primary"
      : "main-faq-step-accordion__group-content";
    panel.dataset.faqStepAccordionPanel = "";
    panel.innerHTML = `
      ${
        isFirstGroup && panelTitle
          ? `<button class="main-faq-step-accordion__panel-toggle" type="button" data-faq-step-accordion-panel-toggle aria-expanded="true">
              <span class="fontSize22">${escapeHtml(panelTitle)}</span>
            </button>`
          : ""
      }
      ${!isFirstGroup && content.title ? `<div class="main-faq-step-accordion__panel-content main-faq-step-accordion__panel-content--title">${content.title}</div>` : ""}
      ${content.content ? `<div class="main-faq-step-accordion__panel-content">${content.content}</div>` : ""}
      <div class="main-faq-step-accordion__panel-body" data-faq-step-accordion-panel-body></div>
    `;
    panel.querySelector(".main-faq-step-accordion__panel-body").append(renderTemplate4Gallery(content.stepList || []));
    return panel;
  }

  return renderAnswerPreview(content);
}

function renderAnswerPreview(answer) {
  const wrapper = document.createElement("div");
  wrapper.className = "answer-preview";

  if (answer.answerTemplate === "template1") {
    wrapper.classList.add("main-support-configurable__faq-answerTemplate1");
    wrapper.innerHTML = answer.content || "";
  }

  if (answer.answerTemplate === "template3") {
    wrapper.append(renderSteps(answer.stepList || [], answer.stepsPerRow || 4));
  }

  if (answer.answerTemplate === "template4") {
    wrapper.append(renderTemplate4Gallery(answer.stepList || []));
  }

  if (answer.answerTemplate === "template5") {
    const grid = document.createElement("div");
    grid.className = "steps-template1";
    (answer.stepList || []).forEach(step => {
      const card = document.createElement("div");
      card.className = "steps-template1-step";
      card.innerHTML = `
        ${imageBoxHtml(step.image, "steps-template1-image")}
        <div class="steps-template1-content">${step.content || ""}</div>
      `;
      grid.append(card);
    });
    wrapper.append(grid);
  }

  if (answer.answerTemplate === "template9") {
    const columns = Number(answer.stepsPerRow) === 3 ? 3 : 2;
    const grid = document.createElement("div");
    grid.className = `steps-template9 steps-template9--columns-${columns}`;
    (answer.stepList || []).forEach(step => {
      const card = document.createElement("div");
      card.className = "steps-template9-step";
      card.innerHTML = `
        <div class="steps-template9-content">${step.headerContent || ""}</div>
        ${imageBoxHtml(step.image, "steps-template9-image")}
        <div class="steps-template9-content">${step.content || ""}</div>
      `;
      grid.append(card);
    });
    wrapper.append(grid);
  }

  if (answer.answerTemplate === "template6") {
    wrapper.append(renderTablePreview(answer));
  }

  if (answer.answerTemplate === "template7") {
    wrapper.innerHTML = `
      <div class="main-faq-answerTemplate7">
        <span class="corner corner-top-left"></span>
        <span class="corner corner-top-right"></span>
        <span class="corner corner-bottom-left"></span>
        <span class="corner corner-bottom-right"></span>
        ${answer.content || ""}
      </div>
    `;
  }

  if (answer.answerTemplate === "template8") {
    wrapper.innerHTML = `
      <div class="main-faq-answerTemplate8">
        <div class="main-faq-answerTemplate8__content">
          <div class="main-faq-answerTemplate8__text">${answer.content || ""}</div>
        </div>
        ${
          answer.image
            ? `<div class="main-faq-answerTemplate8__media"><img class="main-faq-answerTemplate8__image" src="${escapeAttr(answer.image)}" alt="${escapeAttr(answer.imageAlt || "")}" /></div>`
            : ""
        }
      </div>
    `;
  }

  return wrapper;
}

function renderSteps(stepList, stepsPerRow) {
  const grid = document.createElement("div");
  const columns = Number(stepsPerRow) === 3 ? 3 : 4;
  grid.className = `steps-template steps-template--columns-${columns}`;
  stepList.forEach((step, index) => {
    const isRowEnd = (index + 1) % columns === 0;
    const isLast = index === stepList.length - 1;
    const card = document.createElement("div");
    card.className = `steps-template-step${!isLast && !isRowEnd ? " steps-template-step--has-arrow" : ""}`;
    card.innerHTML = `
      ${imageBoxHtml(step.image, "steps-template-image")}
      <div class="steps-template-content">
        <h4 class="steps-template-title">Step ${index + 1}</h4>
        <div class="steps-template-desc">${step.desc || ""}</div>
      </div>
    `;
    grid.append(card);
  });
  return grid;
}

function renderTablePreview(answer) {
  const wrapper = document.createElement("div");
  wrapper.className = "main-faq-troubleshooting-table";
  const headers = answer.headers?.length ? answer.headers : ["Problem", "Cause", "Solution"];
  wrapper.innerHTML = `
    ${answer.content ? `<div class="main-faq-troubleshooting-table__content">${answer.content}</div>` : ""}
    <div class="main-faq-troubleshooting-table__scroller">
      <table class="main-faq-troubleshooting-table__table">
        <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  const tbody = wrapper.querySelector("tbody");
  (answer.rows || []).forEach(row => {
    const cells = row.columns || [row.problem, row.cause, row.solution];
    const tr = document.createElement("tr");
    tr.innerHTML = headers.map((_, index) => `<td>${cells[index] || ""}</td>`).join("");
    tbody.append(tr);
  });
  return wrapper;
}

function renderTemplate4Gallery(stepList) {
  const gallery = document.createElement("div");
  gallery.className = "main-support-configurable__faq-answerTemplate4";
  gallery.dataset.faqStepGallery = "";
  const slides = stepList
    .map(
      (step, index) => `
        <div class="answerTemplate4-step${index === 0 ? " active" : ""}" data-faq-step-slide ${index === 0 ? "" : "aria-hidden=\"true\""}>
          ${imageBoxHtml(step.image, "answerTemplate4-image")}
          <div class="answerTemplate4-footer">${step.desc || ""}</div>
        </div>
      `
    )
    .join("");
  const dots = stepList
    .map((_, index) => `<span class="answerTemplate4-dot${index === 0 ? " active" : ""}" data-faq-step-dot></span>`)
    .join("");
  gallery.innerHTML = `
    <div class="answerTemplate4-track" data-faq-step-track>${slides || `<div class="answerTemplate4-step active" data-faq-step-slide><div class="step-image">Image URL preview</div><div class="answerTemplate4-footer">Step description</div></div>`}</div>
    ${
      stepList.length > 1
        ? `<div class="answerTemplate4-controls">
            <button class="answerTemplate4-button answerTemplate4-button--prev" type="button" data-faq-step-prev aria-label="Previous step" disabled>${galleryArrowIcon("prev")}</button>
            <button class="answerTemplate4-button answerTemplate4-button--next" type="button" data-faq-step-next aria-label="Next step">${galleryArrowIcon("next")}</button>
          </div>
          <div class="answerTemplate4-dots" aria-hidden="true">${dots}</div>`
        : ""
    }
  `;
  return gallery;
}

function buildQuestion() {
  const question = {
    title: (state.title || "").trim(),
    questionTemplate: state.questionTemplate,
  };

  if (state.questionTemplate === "template6") {
    if (state.headerType) question.headerType = state.headerType;
    const answers = (state.answers || []).map(cleanAnswerGroup).filter(Boolean);
    if (answers.length) question.answers = answers;
    return question;
  }

  if (state.questionTemplate !== "template4") {
    if (state.headerType) question.headerType = state.headerType;
    if ((state.link || "").trim()) question.link = state.link.trim();
    const answers = (state.answers || []).map(cleanAnswer).filter(Boolean);
    if (answers.length) question.answers = answers;
  }

  return question;
}

function cleanAnswerGroup(group) {
  const contents = (group.contents || []).map(cleanAnswer).filter(Boolean);
  if (!contents.length) return null;
  return {
    title: group.title || "",
    contents,
  };
}

function cleanAnswer(answer) {
  const result = { answerTemplate: answer.answerTemplate };
  if (answer.answerTemplate === "template1" || answer.answerTemplate === "template7") {
    if (!answer.content?.trim()) return null;
    result.content = compactHtmlForJson(answer.content);
  }
  if (answer.answerTemplate === "template8") {
    if (answer.content?.trim()) result.content = compactHtmlForJson(answer.content);
    if (answer.image?.trim()) result.image = answer.image.trim();
    if (answer.imageAlt?.trim()) result.imageAlt = answer.imageAlt.trim();
    if (!result.content && !result.image) return null;
  }
  if (answer.answerTemplate === "template3") {
    result.stepsPerRow = Number(answer.stepsPerRow) === 3 ? 3 : 4;
    result.stepList = cleanStepList(answer.stepList, "desc");
  }
  if (answer.answerTemplate === "template4") {
    const supportsWrapperFields = state.questionTemplate === "template5" || state.questionTemplate === "template6";
    if (supportsWrapperFields && answer.title?.trim()) result.title = answer.title.trim();
    if (supportsWrapperFields && answer.content?.trim()) result.content = compactHtmlForJson(answer.content);
    result.stepList = cleanStepList(answer.stepList, "desc");
  }
  if (answer.answerTemplate === "template5") {
    result.stepList = cleanStepList(answer.stepList, "content");
  }
  if (answer.answerTemplate === "template9") {
    result.stepsPerRow = Number(answer.stepsPerRow) === 3 ? 3 : 2;
    result.stepList = cleanTemplate9StepList(answer.stepList);
  }
  if (answer.answerTemplate === "template6") {
    result.headers = answer.headers?.length ? answer.headers : ["Problem", "Cause", "Solution"];
    if (answer.content?.trim()) result.content = compactHtmlForJson(answer.content);
    result.rows = (answer.rows || []).map(row => {
      if (row.columns) return { columns: row.columns };
      return { problem: row.problem || "", cause: row.cause || "", solution: row.solution || "" };
    });
  }
  return result;
}

function cleanStepList(stepList = [], textKey) {
  return stepList
    .map(step => ({
      image: step.image || "",
      [textKey]: compactHtmlForJson(step[textKey] || ""),
    }))
    .filter(step => step.image.trim() || String(step[textKey]).trim());
}

function cleanTemplate9StepList(stepList = []) {
  return stepList
    .map(step => ({
      image: step.image || "",
      ...(step.headerContent?.trim() ? { headerContent: compactHtmlForJson(step.headerContent) } : {}),
      content: compactHtmlForJson(step.content || ""),
    }))
    .filter(step => step.image.trim() || step.headerContent || step.content.trim());
}

function updateOutput(showStatus = true) {
  const json = JSON.stringify(appMode === "faq" ? buildFaq() : buildQuestion(), null, 2);
  outputJson.value = json;
  if (showStatus) setStatus("JSON 已生成。");
  return json;
}

function buildFaq() {
  const previousMode = appMode;
  const previousState = state;
  appMode = "single";
  const questions = multiState.questions
    .map(question => {
      state = question;
      return buildQuestion();
    })
    .filter(question => question.title || question.answers?.length);
  state = previousState;
  appMode = previousMode;
  return {
    title: multiState.title || "",
    ...(multiState.headerContent?.trim() ? { headerContent: compactHtmlForJson(multiState.headerContent) } : {}),
    questions,
  };
}

async function generateAndCopy() {
  const json = updateOutput(false);
  try {
    await navigator.clipboard.writeText(json);
    setStatus("JSON 已生成并复制到剪贴板。");
  } catch {
    outputJson.focus();
    outputJson.select();
    setStatus("JSON 已生成。浏览器未允许自动复制，请手动复制输出框内容。", true);
  }
}

function importQuestionJson() {
  const raw = window.prompt("请粘贴单条 question JSON，或完整 FAQ JSON（包含 questions 数组）：");
  if (raw === null) return;

  try {
    const parsed = JSON.parse(raw);
    if (isFaqJson(parsed)) {
      multiState = normalizeImportedFaq(parsed);
      appMode = "faq";
      selectedQuestionIndex = 0;
      state = multiState.questions[0] || createInitialState();
    } else if (appMode === "faqDetail") {
      multiState.questions[selectedQuestionIndex] = normalizeImportedQuestion(parsed);
      state = multiState.questions[selectedQuestionIndex];
    } else {
      state = normalizeImportedQuestion(parsed);
    }
    resetCollapseState();
    render();
    setStatus("已导入 JSON 并填充到内容编辑。");
  } catch (error) {
    setStatus(`导入失败：${error.message}`, true);
  }
}

function isFaqJson(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.questions));
}

function normalizeImportedFaq(faq) {
  if (!faq || typeof faq !== "object" || Array.isArray(faq)) {
    throw new Error("请输入完整 FAQ 对象。");
  }
  if (!Array.isArray(faq.questions)) {
    throw new Error("完整 FAQ JSON 需要包含 questions 数组。");
  }
  return {
    title: faq.title || "",
    headerContent: faq.headerContent || "",
    questions: faq.questions.map(normalizeImportedQuestion),
  };
}

function normalizeImportedQuestion(question) {
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    throw new Error("请输入单个 question 对象。");
  }
  if (!QUESTION_TEMPLATES[question.questionTemplate]) {
    throw new Error(`不支持的 questionTemplate：${question.questionTemplate || "空"}`);
  }

  const imported = {
    title: question.title || "",
    questionTemplate: question.questionTemplate,
    headerType: question.headerType || "",
    link: question.link || "",
    answers: [],
  };

  if (imported.questionTemplate === "template4") return { ...imported, answers: [], headerType: "", link: "" };

  if (imported.questionTemplate === "template6") {
    imported.link = "";
    imported.answers = (question.answers || []).map(group => ({
      title: group.title || "",
      contents: (group.contents || []).map(normalizeImportedAnswer),
    }));
    if (!imported.answers.length) imported.answers = [defaultAnswerGroup("")];
    return imported;
  }

  imported.answers = (question.answers || []).map(normalizeImportedAnswer);
  if (!imported.answers.length && !imported.link) imported.answers = [defaultAnswer("template1")];
  return imported;
}

function normalizeImportedAnswer(answer) {
  if (!answer || typeof answer !== "object") return defaultAnswer("template1");
  const template = ANSWER_TEMPLATES[answer.answerTemplate] ? answer.answerTemplate : "template1";
  const normalized = defaultAnswer(template);
  Object.assign(normalized, answer, { answerTemplate: template });
  if (template === "template3") normalized.stepsPerRow = Number(answer.stepsPerRow) === 3 ? 3 : 4;
  if (template === "template9") normalized.stepsPerRow = Number(answer.stepsPerRow) === 3 ? 3 : 2;
  if (
    (template === "template3" || template === "template4" || template === "template5" || template === "template9") &&
    !Array.isArray(normalized.stepList)
  ) {
    normalized.stepList = [];
  }
  if (template === "template6") {
    normalized.headers = Array.isArray(answer.headers) ? answer.headers : ["Problem", "Cause", "Solution"];
    normalized.rows = Array.isArray(answer.rows) ? answer.rows : [];
  }
  return normalized;
}

function handleAnswerAction(action, index) {
  if (action === "delete") {
    const expandedItem = getExpandedItemForScope(state.answers, "single-answer-cards");
    const deletedItem = state.answers[index];
    state.answers.splice(index, 1);
    restoreExpandedItemForScope(state.answers, "single-answer-cards", deletedItem === expandedItem ? null : expandedItem);
  }
  if (action === "up" && index > 0) swap(state.answers, index, index - 1);
  if (action === "down" && index < state.answers.length - 1) swap(state.answers, index, index + 1);
  render();
}

function handleGroupAction(action, index) {
  if (action === "delete") {
    const expandedItem = getExpandedItemForScope(state.answers, "answer-groups");
    const deletedItem = state.answers[index];
    state.answers.splice(index, 1);
    restoreExpandedItemForScope(state.answers, "answer-groups", deletedItem === expandedItem ? null : expandedItem);
  }
  if (action === "up" && index > 0) swap(state.answers, index, index - 1);
  if (action === "down" && index < state.answers.length - 1) swap(state.answers, index, index + 1);
  if (!state.answers.length) state.answers.push(defaultAnswerGroup(""));
  render();
}

function handleNestedAction(list, index, action) {
  if (action === "delete") list.splice(index, 1);
  if (action === "up" && index > 0) swap(list, index, index - 1);
  if (action === "down" && index < list.length - 1) swap(list, index, index + 1);
  render();
}

function updateAnswer(index, patch) {
  state.answers[index] = { ...state.answers[index], ...patch };
  refreshSide();
}

function refreshSide() {
  renderPreview();
  updateOutput(false);
}

function swap(list, a, b) {
  [list[a], list[b]] = [list[b], list[a]];
}

function moveListItem(list, fromIndex, targetIndex, position = "after") {
  if (fromIndex < 0 || targetIndex < 0 || fromIndex >= list.length || targetIndex >= list.length) return;
  const [item] = list.splice(fromIndex, 1);
  let insertIndex = targetIndex + (position === "after" ? 1 : 0);
  if (fromIndex < insertIndex) insertIndex -= 1;
  list.splice(insertIndex, 0, item);
}

function usesColumns(answer) {
  return Boolean(answer.rows?.[0]?.columns);
}

function resetCollapseState() {
  collapsedCards.clear();
  expandedCardsByScope.clear();
}

function bindCollapseButton(card, collapseKey, options = {}) {
  const header = card.querySelector(":scope > .answer-card-header, :scope > .sub-card-header");
  const body = card.querySelector(":scope > .answer-card-body, :scope > .sub-card-body");
  if (!header || !body) return;

  if (options.scope) {
    card.dataset.collapseScope = options.scope;
    card.dataset.collapseKey = collapseKey;
    if (!expandedCardsByScope.has(options.scope) && options.defaultExpanded) {
      expandedCardsByScope.set(options.scope, collapseKey);
    }
  }

  const expandedKey = options.scope ? expandedCardsByScope.get(options.scope) : null;
  const isCollapsed = options.scope ? expandedKey !== collapseKey : collapsedCards.has(collapseKey);
  body.hidden = isCollapsed;
  card.classList.toggle("is-collapsed", isCollapsed);
  header.setAttribute("role", "button");
  header.setAttribute("tabindex", "0");
  header.setAttribute("aria-expanded", String(!isCollapsed));

  const toggleCard = () => {
    const willCollapse = !body.hidden;
    body.hidden = willCollapse;
    card.classList.toggle("is-collapsed", willCollapse);
    header.setAttribute("aria-expanded", String(!willCollapse));
    if (willCollapse) {
      collapsedCards.add(collapseKey);
      if (options.scope && expandedCardsByScope.get(options.scope) === collapseKey) {
        expandedCardsByScope.delete(options.scope);
      }
      return;
    }

    collapsedCards.delete(collapseKey);
    if (options.scope) {
      expandedCardsByScope.set(options.scope, collapseKey);
      card.parentElement?.querySelectorAll(`:scope > [data-collapse-scope="${options.scope}"]`).forEach(otherCard => {
        if (otherCard === card) return;
        const otherKey = otherCard.dataset.collapseKey;
        const otherBody = otherCard.querySelector(":scope > .answer-card-body, :scope > .sub-card-body");
        const otherHeader = otherCard.querySelector(":scope > .answer-card-header, :scope > .sub-card-header");
        if (!otherBody || !otherHeader || !otherKey) return;
        otherBody.hidden = true;
        otherHeader.setAttribute("aria-expanded", "false");
        otherCard.classList.add("is-collapsed");
        collapsedCards.add(otherKey);
      });
    }
  };

  header.addEventListener("click", event => {
    if (event.target.closest("button, input, select, textarea, a, [data-no-header-toggle]")) return;
    toggleCard();
  });

  header.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("button, input, select, textarea, a, [data-no-header-toggle]")) return;
    event.preventDefault();
    toggleCard();
  });
}

function bindSortableCards(container, selector, list, scope) {
  let dragFromIndex = null;
  let dropPosition = "after";

  const clearDragState = () => {
    container.querySelectorAll(selector).forEach(card => {
      card.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
    });
  };

  container.querySelectorAll(selector).forEach((card, index) => {
    const handle = card.querySelector(":scope > .answer-card-header [data-drag-card], :scope > .sub-card-header [data-drag-card]");
    if (!handle) return;
    card.dataset.sortScope = scope;
    card.dataset.sortIndex = String(index);
    handle.draggable = true;
    handle.addEventListener("click", event => {
      event.stopPropagation();
    });
    handle.addEventListener("dragstart", event => {
      event.stopPropagation();
      dragFromIndex = index;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
      card.classList.add("is-dragging");
    });
    handle.addEventListener("dragend", clearDragState);
    card.addEventListener("dragover", event => {
      event.preventDefault();
      if (dragFromIndex === null || dragFromIndex === index) return;
      const rect = card.getBoundingClientRect();
      dropPosition = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
      container.querySelectorAll(selector).forEach(otherCard => {
        if (otherCard !== card) otherCard.classList.remove("is-drop-before", "is-drop-after");
      });
      card.classList.toggle("is-drop-before", dropPosition === "before");
      card.classList.toggle("is-drop-after", dropPosition === "after");
      event.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("dragleave", event => {
      if (card.contains(event.relatedTarget)) return;
      card.classList.remove("is-drop-before", "is-drop-after");
    });
    card.addEventListener("drop", event => {
      event.preventDefault();
      const fromIndex = dragFromIndex ?? Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isInteger(fromIndex) || fromIndex === index) {
        clearDragState();
        return;
      }
      const expandedItem = getExpandedItemForScope(list, scope);
      moveListItem(list, fromIndex, index, dropPosition);
      restoreExpandedItemForScope(list, scope, expandedItem);
      render();
      setStatus("答案顺序已更新。");
    });
  });
}

function getExpandedItemForScope(list, scope) {
  const expandedKey = expandedCardsByScope.get(scope);
  if (!expandedKey) return null;
  const index = Number(expandedKey.split(":").pop());
  return Number.isInteger(index) ? list[index] : null;
}

function restoreExpandedItemForScope(list, scope, item) {
  collapsedCards.clear();
  expandedCardsByScope.clear();
  if (!item) return;
  const nextIndex = list.indexOf(item);
  if (nextIndex >= 0) expandedCardsByScope.set(scope, `${scope === "answer-groups" ? "group" : "answer"}:${nextIndex}`);
}

function fieldWrapper(labelText, field) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.append(field);
  return label;
}

function inputField(labelText, value, onInput) {
  const input = document.createElement("input");
  input.value = value;
  input.addEventListener("input", event => onInput(event.target.value));
  return fieldWrapper(labelText, input);
}

function textareaField(labelText, value, onInput, options = {}) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.spellcheck = false;
  let validation = null;
  const updateValidation = () => {
    if (!validation) return;
    const result = validateHtmlTags(textarea.value);
    validation.textContent = result.message;
    validation.classList.toggle("is-valid", result.valid);
    validation.classList.toggle("is-invalid", !result.valid);
  };
  textarea.addEventListener("input", event => {
    onInput(event.target.value);
    autoResizeTextarea(textarea);
    updateValidation();
  });
  const label = fieldWrapper(labelText, textarea);
  requestAnimationFrame(() => autoResizeTextarea(textarea));

  if (options.formatHtml) {
    const actions = document.createElement("div");
    actions.className = "html-field-actions";
    const toggleButton = document.createElement("button");
    toggleButton.className = "small";
    toggleButton.type = "button";
    toggleButton.textContent = "收起";
    toggleButton.addEventListener("click", () => {
      const willCollapse = !textarea.hidden;
      textarea.hidden = willCollapse;
      toggleButton.textContent = willCollapse ? "展开" : "收起";
      if (!willCollapse) requestAnimationFrame(() => autoResizeTextarea(textarea));
    });

    const formatButton = document.createElement("button");
    formatButton.className = "small";
    formatButton.type = "button";
    formatButton.textContent = "格式化 HTML";
    formatButton.addEventListener("click", () => {
      textarea.value = formatHtml(textarea.value);
      onInput(textarea.value);
      autoResizeTextarea(textarea);
      updateValidation();
    });
    actions.append(toggleButton, formatButton);
    label.append(actions);

    validation = document.createElement("div");
    validation.className = "html-validation";
    label.append(validation);
    updateValidation();
  }

  return label;
}

function autoResizeTextarea(textarea) {
  if (textarea.hidden) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
}

function formatHtml(source) {
  const input = String(source || "").trim();
  if (!input) return "";

  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const rawTextTags = new Set(["script", "style", "textarea"]);
  const tokens = input
    .replace(/>\s+</g, "><")
    .split(/(<[^>]+>)/g)
    .map(token => token.trim())
    .filter(Boolean);

  const lines = [];
  let depth = 0;
  let rawTextMode = null;

  tokens.forEach(token => {
    const isTag = token.startsWith("<") && token.endsWith(">");
    const closingMatch = isTag ? token.match(/^<\/\s*([a-zA-Z0-9:-]+)/) : null;
    const openingMatch = isTag ? token.match(/^<\s*([a-zA-Z0-9:-]+)/) : null;
    const tagName = (closingMatch?.[1] || openingMatch?.[1] || "").toLowerCase();
    const isComment = token.startsWith("<!--");
    const isClosing = Boolean(closingMatch);
    const isSelfClosing = /\/>$/.test(token) || voidTags.has(tagName) || token.startsWith("<!");

    if (isClosing) depth = Math.max(0, depth - 1);
    lines.push(`${"  ".repeat(depth)}${token}`);

    if (rawTextMode && isClosing && tagName === rawTextMode) rawTextMode = null;
    if (!rawTextMode && isTag && !isClosing && !isSelfClosing && rawTextTags.has(tagName)) rawTextMode = tagName;
    if (!rawTextMode && isTag && !isClosing && !isSelfClosing && !isComment) depth += 1;
  });

  return lines.join("\n");
}

function compactHtmlForJson(source) {
  return String(source || "")
    .trim()
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/>\s+</g, "><")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/\s{2,}/g, " ");
}

function normalizeHtmlForPreview(source) {
  return String(source || "")
    .trim()
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

function validateHtmlTags(source) {
  const input = String(source || "").trim();
  if (!input) return { valid: true, message: "HTML 标签校验通过。" };

  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const stack = [];
  const tagPattern = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g;
  let match;

  while ((match = tagPattern.exec(input))) {
    const token = match[0];
    const tagName = match[1]?.toLowerCase();
    if (!tagName || token.startsWith("<!--") || token.startsWith("<![CDATA")) continue;
    if (token.startsWith("<!") || token.startsWith("<?")) continue;
    if (voidTags.has(tagName) || /\/\s*>$/.test(token)) continue;

    if (token.startsWith("</")) {
      const last = stack.pop();
      if (!last) {
        return { valid: false, message: `多余的闭合标签 </${tagName}>。` };
      }
      if (last.name !== tagName) {
        return {
          valid: false,
          message: `标签闭合顺序不正确：<${last.name}> 需要先用 </${last.name}> 闭合，但遇到了 </${tagName}>。`,
        };
      }
    } else {
      stack.push({ name: tagName });
    }
  }

  if (stack.length) {
    const missing = stack.reverse().map(item => `</${item.name}>`).join("、");
    return { valid: false, message: `缺少闭合标签：${missing}。` };
  }

  return { valid: true, message: "HTML 标签校验通过。" };
}

function createSelect(options, selected, onInput) {
  const select = document.createElement("select");
  options.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === selected;
    select.append(option);
  });
  select.addEventListener("input", event => onInput(event.target.value));
  return select;
}

function optionsHtml(options, selected) {
  return Object.entries(options)
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("");
}

function imageBoxHtml(src, imageClass = "") {
  if (!src) return `<div class="step-image">Image URL preview</div>`;
  if (imageClass) {
    return `<img class="${imageClass}" src="${escapeAttr(src)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'step-image', textContent: 'Image failed to load' }))" />`;
  }
  return `<div class="step-image"><img src="${escapeAttr(src)}" alt="" onerror="this.parentElement.textContent='Image failed to load'" /></div>`;
}

function trafficDotsHtml(className = "traffic-dots") {
  return `<span class="${className}"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></span>`;
}

function toggleIconHtml(classPrefix, iconType = "plus") {
  const firstPath =
    iconType === "plus"
      ? `<path d="M12 0V24" stroke="white" stroke-width="4"/><path d="M0 12H24" stroke="white" stroke-width="4"/>`
      : `<path d="M8 4L16 12L8 20" stroke="white" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter"/>`;
  return `
    <span class="${classPrefix}" aria-hidden="true">
      <svg class="${classPrefix}-icon1" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${firstPath}</svg>
      <svg class="${classPrefix}-icon2" width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.97056 16.9656H28.9706" stroke="white" stroke-width="4"/>
      </svg>
    </span>
  `;
}

function galleryArrowIcon(direction) {
  const path =
    direction === "prev"
      ? "M11.25 3.75L6 9L11.25 14.25"
      : "M6.75 3.75L12 9L6.75 14.25";
  return `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="${path}" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>
    </svg>
  `;
}

function bindPreviewInteractions(root) {
  root.querySelectorAll("[data-faq-step-gallery]").forEach(gallery => {
    updateFaqStepSlides(gallery, getActiveSlideIndex(gallery));
  });

  root.addEventListener("click", event => {
    const faqToggle = event.target.closest(".main-support-configurable__faq-toggle");
    if (faqToggle) {
      const item = faqToggle.closest(".main-support-configurable__faq-item:not([data-link])");
      if (item) {
        const wasOpen = item.open;
        requestAnimationFrame(() => {
          if (!wasOpen && item.open) {
            const list = item.closest(".main-support-configurable__faq");
            list?.querySelectorAll(".main-support-configurable__faq-item[open]:not([data-link])").forEach(other => {
              if (other !== item) other.open = false;
            });
          }
        });
      }
    }

    const stepToggle = event.target.closest("[data-faq-step-accordion-toggle]");
    if (stepToggle) {
      const accordion = stepToggle.closest("[data-faq-step-accordion]");
      const body = accordion?.querySelector("[data-faq-step-accordion-body]");
      if (!accordion || !body) return;
      setAccordionOpen(accordion, body.hidden);
      return;
    }

    const panelToggle = event.target.closest("[data-faq-step-accordion-panel-toggle]");
    if (panelToggle) {
      const panel = panelToggle.closest("[data-faq-step-accordion-panel]");
      const body = panel?.querySelector("[data-faq-step-accordion-panel-body]");
      if (!panel || !body) return;
      setPanelOpen(panel, body.hidden);
      return;
    }

    const nextStepButton = event.target.closest("[data-faq-step-next]");
    const prevStepButton = event.target.closest("[data-faq-step-prev]");
    if (!nextStepButton && !prevStepButton) return;
    const button = nextStepButton || prevStepButton;
    if (button.disabled) return;

    const gallery = button.closest("[data-faq-step-gallery]");
    if (!gallery) return;
    const slides = Array.from(gallery.querySelectorAll("[data-faq-step-slide]"));
    const activeIndex = getActiveSlideIndex(gallery);
    const direction = nextStepButton ? 1 : -1;
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;

    gallery.classList.remove("is-moving-prev", "is-moving-next");
    gallery.classList.add(direction > 0 ? "is-moving-next" : "is-moving-prev");
    updateFaqStepSlides(gallery, nextIndex);
    window.setTimeout(() => {
      gallery.classList.remove("is-moving-prev", "is-moving-next");
    }, 520);
  });
}

function setAccordionOpen(accordion, isOpen) {
  const toggle = accordion.querySelector("[data-faq-step-accordion-toggle]");
  const body = accordion.querySelector("[data-faq-step-accordion-body]");
  const extraPanels = accordion.querySelectorAll("[data-faq-step-accordion-extra]");
  if (!toggle || !body) return;

  body.hidden = !isOpen;
  extraPanels.forEach(panel => {
    panel.hidden = !isOpen;
  });
  toggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    accordion.querySelectorAll("[data-faq-step-accordion-panel]").forEach(panel => setPanelOpen(panel, true));
  }
}

function setPanelOpen(panel, isOpen) {
  const toggle = panel.querySelector("[data-faq-step-accordion-panel-toggle]");
  const body = panel.querySelector("[data-faq-step-accordion-panel-body]");
  if (!toggle || !body) return;
  body.hidden = !isOpen;
  toggle.setAttribute("aria-expanded", String(isOpen));
}

function getActiveSlideIndex(gallery) {
  const slides = Array.from(gallery.querySelectorAll("[data-faq-step-slide]"));
  return Math.max(
    0,
    slides.findIndex(slide => slide.classList.contains("active"))
  );
}

function updateFaqStepSlides(gallery, activeIndex) {
  const slides = Array.from(gallery.querySelectorAll("[data-faq-step-slide]"));
  const dots = Array.from(gallery.querySelectorAll("[data-faq-step-dot]"));
  const prevButton = gallery.querySelector("[data-faq-step-prev]");
  const nextButton = gallery.querySelector("[data-faq-step-next]");

  slides.forEach((slide, index) => {
    const isActive = index === activeIndex;
    slide.classList.toggle("active", isActive);
    slide.toggleAttribute("aria-hidden", !isActive);
  });
  dots.forEach((dot, index) => dot.classList.toggle("active", index === activeIndex));

  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= slides.length - 1;
  if (prevButton) {
    prevButton.disabled = isFirst;
    prevButton.classList.toggle("answerTemplate4-button--next", !isFirst);
    prevButton.classList.toggle("answerTemplate4-button--prev", isFirst);
  }
  if (nextButton) {
    nextButton.disabled = isLast;
    nextButton.classList.toggle("answerTemplate4-button--next", !isLast);
    nextButton.classList.toggle("answerTemplate4-button--prev", isLast);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function setStatus(message, isError = false) {
  statusEl.classList.toggle("error", isError);
  statusEl.innerHTML = isError ? `<strong>提示：</strong>${escapeHtml(message)}` : `<strong>${escapeHtml(message)}</strong>`;
}

document.querySelector("#generateBtn").addEventListener("click", generateAndCopy);
document.querySelector("#singleModeBtn").addEventListener("click", () => {
  appMode = "single";
  resetCollapseState();
  render();
  setStatus("已切换到单条问题生成器。");
});
document.querySelector("#faqModeBtn").addEventListener("click", () => {
  appMode = "faq";
  syncStateFromMode();
  resetCollapseState();
  render();
  setStatus("已切换到完整 FAQ 生成器。");
});
document.querySelector("#resetBtn").addEventListener("click", () => {
  if (appMode === "faq" || appMode === "faqDetail") {
    multiState = createFaqSampleState();
    selectedQuestionIndex = 0;
    state = multiState.questions[0];
    appMode = "faq";
  } else {
    state = createInitialState();
  }
  resetCollapseState();
  render();
  setStatus("已重置。");
});
document.querySelector("#sampleBtn").addEventListener("click", () => {
  if (appMode === "faq" || appMode === "faqDetail") {
    multiState = createFaqSampleState();
    selectedQuestionIndex = 0;
    state = multiState.questions[0];
    appMode = "faq";
  } else {
    state = createSampleState();
  }
  resetCollapseState();
  render();
  setStatus("已填充示例。");
});
document.querySelector("#importJsonBtn").addEventListener("click", importQuestionJson);

render();
