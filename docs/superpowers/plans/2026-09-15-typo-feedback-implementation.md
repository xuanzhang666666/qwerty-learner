# 拼写错误提示交互实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 错误按键只播放提示音并记录错误，不清空或改变已输入正确前缀。

**Architecture:** 在 `WordComponent` 的按键入口先比较当前按键和目标位置字符。错误时只记录错误、播放错误音并返回；正确时才将字符追加到 `inputWord`，沿用既有 effect 完成正确字符着色和单词完成逻辑。端到端测试直接覆盖“错误后继续完成单词”的路径。

**Tech Stack:** React 18、TypeScript、Immer、Playwright。

---

## 文件结构

- 修改 `src/pages/Typing/components/WordPanel/components/Word/index.tsx`：在输入写入前判断正确性，删除错误后重置输入的 effect。
- 修改 `tests/e2e/practice.spec.ts`：增加用户可在一次错误后直接完成单词的回归测试。
- 修改 `playwright.config.ts`：允许 `PLAYWRIGHT_BASE_URL` 覆盖默认线上地址，确保回归测试可指向本机 Vite 服务。

### Task 1: 编写本机可运行的失败回归测试

**Files:**

- Modify: `playwright.config.ts:25-31`
- Modify: `tests/e2e/practice.spec.ts:61-70`

- [ ] **Step 1: 让 Playwright 接受本机地址覆盖**

将 `baseURL` 替换为：

```ts
baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://qwerty.kaiyi.cool',
```

- [ ] **Step 2: 写入失败的端到端测试**

在 `tests/e2e/practice.spec.ts` 的 `Enter the wrong word` 测试后添加：

```ts
test('keeps the correct prefix after a wrong key so the word can be completed', async ({ page }) => {
  await page.keyboard.press('Enter')
  await page.keyboard.press('c')
  await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-green-600/)

  await page.keyboard.press('x')
  await expect(page.locator('span', { hasText: /^a$/ })).not.toHaveClass(/text-red-600/)

  await pressWord(page, 'ancel')
  await expect(page.locator('span', { hasText: /^e$/ }).first()).toBeVisible()
  await expect(page.locator('div', { hasText: '输入数' }).locator('span', { hasText: /^6$/ }).first()).toBeVisible()
})
```

- [ ] **Step 3: 运行测试并确认其因旧行为失败**

运行：

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test tests/e2e/practice.spec.ts --project=chromium --grep 'keeps the correct prefix'
```

预期：失败，因为旧逻辑会将目标字符显示为红色，并在 300ms 后清空 `inputWord`，无法完成 `cancel`。

- [ ] **Step 4: 提交失败测试**

```sh
git add playwright.config.ts tests/e2e/practice.spec.ts
git commit -m "test: cover typo feedback without reset"
```

### Task 2: 仅在按键正确时追加输入

**Files:**

- Modify: `src/pages/Typing/components/WordPanel/components/Word/index.tsx:14-15,100-134,196-278`

- [ ] **Step 1: 在 `updateInput` 中比较待输入字符**

将 `add` 分支改为以下逻辑；空格仍以 `EXPLICIT_SPACE` 存储，大小写继续遵守 `isIgnoreCaseAtom`：

```ts
case 'add': {
  const inputChar = updateAction.value === ' ' ? EXPLICIT_SPACE : updateAction.value
  if (updateAction.value === ' ') updateAction.event.preventDefault()

  const inputIndex = wordState.inputWord.length
  const correctChar = wordState.displayWord[inputIndex]
  const isEqual =
    inputChar !== undefined &&
    correctChar !== undefined &&
    (isIgnoreCase ? inputChar.toLowerCase() === correctChar.toLowerCase() : inputChar === correctChar)

  if (!isEqual) {
    playBeepSound()
    setWordState((state) => {
      state.wrongCount += 1
      state.hasMadeInputWrong = true
      if (state.letterMistake[inputIndex]) state.letterMistake[inputIndex].push(inputChar)
      else state.letterMistake[inputIndex] = [inputChar]
    })
    dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD, payload: { letterMistake: { [inputIndex]: [inputChar] } } })
    if (currentChapter === 0 && state.chapterData.index === 0 && wordState.wrongCount >= 3) setShowTipAlert(true)
    return
  }

  setWordState((state) => {
    state.inputWord += inputChar
  })
  break
}
```

- [ ] **Step 2: 删除不再适用的错误重置路径**

删除 `getSentenceResetStateAfterWrongInput` 的 import、`hasWrong` 早退条件、输入 effect 中的错误分支，以及依赖 `wordState.hasWrong` 的 300ms 重置 effect。保留正确输入 effect 中的计时、正确统计、声音和完成逻辑。

- [ ] **Step 3: 运行失败测试并确认通过**

运行：

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test tests/e2e/practice.spec.ts --project=chromium --grep 'keeps the correct prefix'
```

预期：通过；按 `x` 后 `a` 保持普通颜色，随后输入 `ancel` 显示下一个单词，输入数为 6（5 次正确按键加 1 次错误按键）。

- [ ] **Step 4: 执行相关测试与生产构建**

运行：

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test tests/e2e/practice.spec.ts --project=chromium
npm run test
npm run build
```

预期：命令均以退出码 0 完成。

- [ ] **Step 5: 提交实现**

```sh
git add src/pages/Typing/components/WordPanel/components/Word/index.tsx playwright.config.ts tests/e2e/practice.spec.ts
git commit -m "fix: keep typing progress after typo"
```
