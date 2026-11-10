"use strict";

/*
    CanavarHub — Main Script
    Backend API ilə inteqrasiya olunmuş versiya
*/

// ============ AUTH UI ============

function updateAuthUI() {
  const authBtn = document.getElementById("auth-btn");
  if (!authBtn) return;

  if (AuthService.isLoggedIn()) {
    const user = AuthService.getUser();
    authBtn.textContent = user ? user.fullName : "Profilim";
    authBtn.href = "#";
    authBtn.onclick = function (e) {
      e.preventDefault();
      if (confirm("Çıxış etmək istəyirsiniz?")) {
        AuthService.logout();
        window.location.reload();
      }
    };
  } else {
    authBtn.textContent = "Daxil ol";
    authBtn.href = "./pages/loginPage/login.html";
    authBtn.onclick = null;
  }
}

// ============ MODULES — Dinamik Yüklənmə ============

let currentModuleSlug = "ingilis-dili";
let modulesData = [];

async function loadModules() {
  const grid = document.querySelector(".module-grid");
  if (!grid) return;

  const result = await ModulesService.getAll();

  if (!result.ok || !result.data) {
    console.warn("Modullar yüklənmədi — statik versiya istifadə olunur.");
    return; // statik HTML qalsın
  }

  modulesData = result.data;
  grid.innerHTML = "";

  result.data.forEach((mod) => {
    const card = document.createElement("article");
    card.className = "module-card";
    card.dataset.slug = mod.slug;
    card.style.cursor = "pointer";

    let statLabel1 = "Səviyyə";
    let statValue1 = mod.levelCount;
    let statLabel2 = "Sual";
    let statValue2 = mod.totalQuestions > 0 ? mod.totalQuestions + "+" : "0";

    // Şahmat və Diksiya üçün fərqli etiketlər
    if (mod.type === "Chess") {
      statLabel1 = "Mərhələ";
      statLabel2 = "AI səviyyə";
      statValue2 = "4";
    } else if (mod.type === "Diction") {
      statLabel1 = "Dərs";
      statValue1 = "10+";
      statLabel2 = "Blok";
      statValue2 = mod.levelCount;
    }

    card.innerHTML = `
      <span class="module-icon ${mod.colorScheme}" aria-hidden="true"> ${mod.iconEmoji} </span>
      <h3>${mod.name}</h3>
      <p>${mod.description}</p>
      <div class="module-stats">
        <div>
          <strong>${statValue1}</strong>
          <span>${statLabel1}</span>
        </div>
        <div>
          <strong>${statValue2}</strong>
          <span>${statLabel2}</span>
        </div>
      </div>
    `;

    // Karta basanda həmin modulun suallarına keç
    card.addEventListener("click", () => {
      selectModule(mod.slug, mod.name);
    });

    grid.appendChild(card);
  });
}

async function selectModule(slug, moduleName) {
  currentModuleSlug = slug;

  // Aktiv kartı işarələ
  document.querySelectorAll(".module-card").forEach((c) => {
    c.classList.toggle("selected", c.dataset.slug === slug);
  });

  // Suallar bölməsinin başlığını yenilə
  const questionsTitle = document.getElementById("questions-title");
  if (questionsTitle) {
    questionsTitle.textContent = `${moduleName} — səviyyəni yoxla`;
  }

  // Modulun səviyyələrini yüklə və tabları yarat
  await loadModuleLevels(slug);

  // Suallar bölməsinə scroll et
  const questionsSection = document.getElementById("questions");
  if (questionsSection) {
    questionsSection.scrollIntoView({ behavior: "smooth" });
  }
}

async function loadModuleLevels(slug) {
  const tabsContainer = document.querySelector(".tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = `<span style="color:var(--muted); font-size:0.9rem;">Səviyyələr yüklənir...</span>`;

  const result = await ModulesService.getLevels(slug);

  if (!result.ok || !result.data || result.data.length === 0) {
    tabsContainer.innerHTML = `<span style="color:var(--muted); font-size:0.9rem;">Bu modul üçün səviyyə tapılmadı.</span>`;
    const container = document.getElementById("question-container");
    if (container) {
      container.innerHTML = `
        <article class="question-card active">
          <span class="level-badge">Sual yoxdur</span>
          <h3>Bu modul üçün hələ sual əlavə edilməyib.</h3>
        </article>
      `;
    }
    return;
  }

  // Tabları yarat
  tabsContainer.innerHTML = "";
  result.data.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (index === 0 ? " active" : "");
    btn.type = "button";
    btn.role = "tab";
    btn.dataset.levelCode = level.code;
    btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    btn.textContent = level.code;
    tabsContainer.appendChild(btn);
  });

  // Tab click hadisələrini bağla
  initDynamicTabs();

  // İlk səviyyənin suallarını yüklə
  const firstCode = result.data[0].code;
  await loadQuestions(firstCode);
}

function initDynamicTabs() {
  const tabs = document.querySelector(".tabs");
  if (!tabs) return;

  tabs.addEventListener("click", function (event) {
    const clickedTab = event.target.closest(".tab");
    if (!clickedTab) return;

    const levelCode = clickedTab.dataset.levelCode;
    if (!levelCode) return;

    tabs.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
    });

    clickedTab.classList.add("active");
    clickedTab.setAttribute("aria-selected", "true");

    loadQuestions(levelCode);
  });
}

// ============ QUESTIONS — Dinamik Yüklənmə ============

let currentQuestions = [];
let currentQuestionIndex = 0;

async function loadQuestions(levelCode) {
  const container = document.getElementById("question-container");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:40px; color:#6b6a63;">Yüklənir...</div>`;

  const result = await QuestionsService.getByModuleAndLevel(currentModuleSlug, levelCode);

  if (!result.ok || !result.data || result.data.length === 0) {
    container.innerHTML = `
      <article class="question-card active">
        <span class="level-badge">${levelCode} · Sual yoxdur</span>
        <h3>Bu səviyyə üçün sual tapılmadı.</h3>
        <p style="color:#6b6a63;">Backend-dən suallar yüklənmədi. Server işləyirmi?</p>
      </article>
    `;
    return;
  }

  currentQuestions = result.data;
  currentQuestionIndex = 0;
  renderQuestion(levelCode);
}

// ============ CHESS BOARD RENDERER ============

const pieceSymbols = {
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
};

function buildChessBoardHTML(fen) {
  if (!fen) return "";

  const fenPositionPart = fen.trim().split(" ")[0];
  const ranks = fenPositionPart.split("/");
  if (ranks.length !== 8) return "";

  let boardHTML = `<div class="chess-board-wrapper"><div class="chess-board-container"><div class="chess-board" id="interactiveChessBoard">`;

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  for (let r = 0; r < 8; r++) {
    const rankStr = ranks[r];
    const rankNum = 8 - r;
    let fileIdx = 0;

    for (let i = 0; i < rankStr.length; i++) {
      const char = rankStr[i];
      if (char >= "1" && char <= "8") {
        const emptyCount = parseInt(char);
        for (let e = 0; e < emptyCount; e++) {
          const isLight = (r + fileIdx) % 2 === 0;
          const squareColorClass = isLight ? "light" : "dark";
          const fileLetter = files[fileIdx];
          const sq = `${fileLetter}${rankNum}`;

          let coordHTML = "";
          if (fileIdx === 0) {
            coordHTML += `<span class="chess-square-coord rank-label">${rankNum}</span>`;
          }
          if (r === 7) {
            coordHTML += `<span class="chess-square-coord file-label">${fileLetter}</span>`;
          }

          boardHTML += `<div class="chess-square ${squareColorClass}" data-sq="${sq}">${coordHTML}</div>`;
          fileIdx++;
        }
      } else {
        const isLight = (r + fileIdx) % 2 === 0;
        const squareColorClass = isLight ? "light" : "dark";
        const fileLetter = files[fileIdx];
        const sq = `${fileLetter}${rankNum}`;
        const isWhitePiece = char === char.toUpperCase();
        const pieceClass = isWhitePiece ? "white-piece" : "black-piece";
        const symbol = pieceSymbols[char] || char;

        let coordHTML = "";
        if (fileIdx === 0) {
          coordHTML += `<span class="chess-square-coord rank-label">${rankNum}</span>`;
        }
        if (r === 7) {
          coordHTML += `<span class="chess-square-coord file-label">${fileLetter}</span>`;
        }

        boardHTML += `
          <div class="chess-square ${squareColorClass}" data-sq="${sq}" data-piece="${char}">
            ${coordHTML}
            <span class="chess-piece ${pieceClass}">${symbol}</span>
          </div>
        `;
        fileIdx++;
      }
    }
  }

  boardHTML += `</div>
    <div class="chess-board-status" id="chessBoardStatus">💡 İpucu: Lövhədə fiqura və gediş edəcəyiniz xanaya klikləyərək oynayın!</div>
    <div class="chess-explanation" id="chessExplanation" style="display:none; margin-top:15px; background:#f0fdf4; border:1px solid #86efac; color:#166534; padding:15px; border-radius:12px; font-size:0.95rem; line-height:1.5;"></div>
  </div></div>`;
  return boardHTML;
}

function getPieceTypeFromNotation(optA) {
  if (!optA) return null;
  const clean = optA.replace(/^\d+[\.\s]*/g, "").trim(); // e.g. "Vxf7#", "Tb8#", "Ad6+"
  const firstChar = clean.charAt(0).toUpperCase();

  if (firstChar === "V") return ["Q", "q"];
  if (firstChar === "T") return ["R", "r"];
  if (firstChar === "A") return ["N", "n"];
  if (firstChar === "F") return ["B", "b"];
  if (firstChar === "K") return ["K", "k"];
  return null;
}

function extractTargetSquare(q) {
  if (!q) return "";
  const optA = (q.options && q.options[0]) ? q.options[0] : "";
  const text = q.text || "";

  // 1. Look for move notation in Opt A like 1. Tb8#, 1. Vxf7#, 1. Ad6+, 1. Fd2, 1... Vh4#
  const optMatches = optA.match(/([a-h][1-8])/gi);
  if (optMatches && optMatches.length > 0) {
    return optMatches[0].toLowerCase();
  }

  // 2. Look in question text for move notation
  const textMatches = text.match(/([a-h][1-8])/gi);
  if (textMatches && textMatches.length > 0) {
    return textMatches[textMatches.length - 1].toLowerCase();
  }

  return "";
}

function initChessBoardInteractivity(q) {
  const board = document.getElementById("interactiveChessBoard");
  const statusEl = document.getElementById("chessBoardStatus");
  const explanationEl = document.getElementById("chessExplanation");
  const nextBtn = document.getElementById("next-question-btn");

  if (!board || !q) return;

  const targetToSq = extractTargetSquare(q);
  const expectedPieces = getPieceTypeFromNotation(q.options && q.options[0]);
  let selectedSqEl = null;

  board.querySelectorAll(".chess-square").forEach((sqEl) => {
    sqEl.addEventListener("click", function () {
      const sqName = this.dataset.sq;
      const piece = this.dataset.piece;

      // 1. If no square selected yet, select a square with a piece
      if (!selectedSqEl) {
        if (!piece) {
          if (statusEl) {
            statusEl.style.color = "#f59e0b";
            statusEl.textContent = "⚠️ Zəhmət olmasa ilk öncə öz fiqurunuza klikləyin!";
          }
          return;
        }
        selectedSqEl = this;
        this.classList.add("selected-sq");
        if (statusEl) {
          statusEl.style.color = "#b8b6ac";
          statusEl.textContent = `📍 [${sqName.toUpperCase()}] seçildi. İndi gediş yerini seçin!`;
        }
        return;
      }

      // 2. If clicking the same square, deselect
      if (selectedSqEl === this) {
        selectedSqEl.classList.remove("selected-sq");
        selectedSqEl = null;
        if (statusEl) {
          statusEl.style.color = "#b8b6ac";
          statusEl.textContent = "💡 İpucu: Lövhədə fiqura və gediş edəcəyiniz xanaya klikləyərək oynayın!";
        }
        return;
      }

      // 3. Move piece to target square
      const sourceSquare = selectedSqEl;
      const destSquare = this;
      const fromSq = sourceSquare.dataset.sq;
      const toSq = sqName;
      const movingPieceSymbolEl = sourceSquare.querySelector(".chess-piece");
      const movingPieceChar = sourceSquare.dataset.piece;

      if (!movingPieceSymbolEl) {
        sourceSquare.classList.remove("selected-sq");
        selectedSqEl = null;
        return;
      }

      // Move piece to destination square FIRST so the user sees their move executed
      const existingPieceOnDest = destSquare.querySelector(".chess-piece");
      destSquare.appendChild(movingPieceSymbolEl);
      destSquare.dataset.piece = movingPieceChar;
      delete sourceSquare.dataset.piece;

      board.querySelectorAll(".chess-square").forEach(s => s.classList.remove("selected-sq", "last-move"));
      sourceSquare.classList.add("last-move");
      destSquare.classList.add("last-move");

      // Validate Piece Type AND Destination Square
      let isPieceMatch = true;
      if (expectedPieces && movingPieceChar) {
        isPieceMatch = expectedPieces.includes(movingPieceChar);
      }
      const isSquareMatch = targetToSq ? (toSq.toLowerCase() === targetToSq) : true;
      const isCorrectMove = isPieceMatch && isSquareMatch;

      if (isCorrectMove) {
        // === CORRECT MOVE ===
        if (existingPieceOnDest) {
          existingPieceOnDest.remove();
        }

        if (statusEl) {
          statusEl.style.color = "#10b981";
          statusEl.style.fontWeight = "700";
          statusEl.textContent = `🎉 Təbriklər! Doğru gediş etdiniz: ${fromSq.toUpperCase()} ➔ ${toSq.toUpperCase()}! ✔️`;
        }

        // Show explanation
        if (explanationEl) {
          explanationEl.style.display = "block";
          explanationEl.innerHTML = `<strong>💡 Doğru Cavabın İzahı:</strong><br>${q.explanation || 'Təbriklər, bu bulmacanı uğurla həll etdiniz!'}`;
        }

        // Auto-submit answer to backend API
        if (AuthService.isLoggedIn()) {
          ProgressService.submitAnswer(q.id, 0);
        }

        // Enable Next Button
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = "1";
          nextBtn.style.cursor = "pointer";
          nextBtn.classList.remove("disabled");
        }

        selectedSqEl = null;
      } else {
        // === INCORRECT MOVE ===
        if (statusEl) {
          statusEl.style.color = "#ef4444";
          statusEl.style.fontWeight = "700";
          statusEl.textContent = `❌ Bu xod yanlışdır, yenidən sınayın! (${fromSq.toUpperCase()} ➔ ${toSq.toUpperCase()})`;
        }

        // Flash red
        destSquare.style.backgroundColor = "#f87171";
        board.style.pointerEvents = "none";

        // Revert move after 1.2 seconds
        setTimeout(() => {
          destSquare.style.backgroundColor = "";
          
          // Revert moving piece back to source square
          sourceSquare.appendChild(movingPieceSymbolEl);
          sourceSquare.dataset.piece = movingPieceChar;
          delete destSquare.dataset.piece;

          // Restore captured piece if any
          if (existingPieceOnDest) {
            destSquare.appendChild(existingPieceOnDest);
            destSquare.dataset.piece = existingPieceOnDest.parentNode ? destSquare.dataset.piece : (movingPieceChar === movingPieceChar.toUpperCase() ? 'p' : 'P');
          }

          board.querySelectorAll(".chess-square").forEach(s => s.classList.remove("selected-sq", "last-move"));
          board.style.pointerEvents = "auto";

          if (statusEl) {
            statusEl.style.color = "#b8b6ac";
            statusEl.style.fontWeight = "normal";
            statusEl.textContent = "💡 İpucu: Lövhədə fiqura və gediş edəcəyiniz xanaya klikləyərək oynayın!";
          }
        }, 1200);

        selectedSqEl = null;
      }
    });
  });
}

// ============ LOGIC QUESTION WIDGET BUILDERS ============

function buildCubeNetHTML(cubeStr) {
  if (!cubeStr) return "";
  const parts = cubeStr.split(",").map((s) => s.trim());
  const top = parts[0] || "1";
  const left = parts[1] || "3";
  const center = parts[2] || "2";
  const right = parts[3] || "4";
  const bottom = parts[4] || "5";
  const back = parts[5] || "6";

  return `
    <div class="visual-widget-wrapper">
      <div class="cube-net-container">
        <div class="cube-net-grid">
          <div class="cube-face empty"></div>
          <div class="cube-face top">${top}</div>
          <div class="cube-face empty"></div>
          <div class="cube-face empty"></div>

          <div class="cube-face left">${left}</div>
          <div class="cube-face center">${center}</div>
          <div class="cube-face right">${right}</div>
          <div class="cube-face empty"></div>

          <div class="cube-face empty"></div>
          <div class="cube-face bottom">${bottom}</div>
          <div class="cube-face empty"></div>
          <div class="cube-face empty"></div>

          <div class="cube-face empty"></div>
          <div class="cube-face back">${back}</div>
          <div class="cube-face empty"></div>
          <div class="cube-face empty"></div>
        </div>
        <div class="widget-caption">Açılmış Kub Şəbəkəsi (Cube Net)</div>
      </div>
    </div>
  `;
}

function buildGridHTML(gridStr) {
  if (!gridStr) return "";
  const rows = gridStr.split("|").map((r) => r.trim());
  if (rows.length === 0) return "";
  const firstRowCols = rows[0].split(",").map((c) => c.trim());
  const colsCount = firstRowCols.length;

  let cellsHTML = "";
  rows.forEach((row) => {
    const cols = row.split(",").map((c) => c.trim());
    cols.forEach((val) => {
      const isTarget = val === "?";
      cellsHTML += `<div class="grid-cell ${isTarget ? "target" : ""}">${val}</div>`;
    });
  });

  return `
    <div class="visual-widget-wrapper">
      <div class="logic-grid-container">
        <div class="logic-grid" style="grid-template-columns: repeat(${colsCount}, 1fr);">
          ${cellsHTML}
        </div>
        <div class="widget-caption">Matris Məntiqi Diaqramı</div>
      </div>
    </div>
  `;
}

function buildScaleHTML(scaleStr) {
  if (!scaleStr) return "";
  const parts = scaleStr.split("|").map((s) => s.trim());
  const leftPan = parts[0] || "Sol";
  const rightPan = parts[1] || "Sağ";

  return `
    <div class="visual-widget-wrapper">
      <div class="scale-container">
        <div class="scale-body">
          <div class="scale-beam"></div>
          <div class="scale-pans">
            <div class="scale-pan left"><span>${leftPan}</span></div>
            <div class="scale-pan right"><span>${rightPan}</span></div>
          </div>
          <div class="scale-base">▲</div>
        </div>
        <div class="widget-caption">Tərəzi Tarazlığı</div>
      </div>
    </div>
  `;
}

function buildVennHTML(vennStr) {
  if (!vennStr) return "";
  const parts = vennStr.split("|").map((s) => s.trim());
  const setA = parts[0] || "Çoxluq A";
  const setB = parts[1] || "Çoxluq B";
  const both = parts[2] || "Kəsişmə";

  return `
    <div class="visual-widget-wrapper">
      <div class="venn-container">
        <div class="venn-circle circle-a"><span>${setA}</span></div>
        <div class="venn-circle circle-b"><span>${setB}</span></div>
        <div class="venn-intersection"><span>${both}</span></div>
      </div>
      <div class="widget-caption">Venn Diaqramı</div>
    </div>
  `;
}

function buildClockHTML(clockStr) {
  if (!clockStr) return "";
  const timeParts = clockStr.split(":").map((t) => parseInt(t.trim()) || 0);
  const hours = timeParts[0] || 12;
  const mins = timeParts[1] || 0;

  const minDeg = mins * 6;
  const hourDeg = (hours % 12) * 30 + mins * 0.5;

  return `
    <div class="visual-widget-wrapper">
      <div class="clock-container">
        <div class="clock-face">
          <div class="clock-hand hour-hand" style="transform: rotate(${hourDeg}deg);"></div>
          <div class="clock-hand minute-hand" style="transform: rotate(${minDeg}deg);"></div>
          <div class="clock-center"></div>
        </div>
      </div>
      <div class="widget-caption">Saat ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}</div>
    </div>
  `;
}

function buildTableHTML(tableStr) {
  if (!tableStr) return "";
  const rows = tableStr.split("|").map((r) => r.trim());
  if (rows.length === 0) return "";

  const headerCols = rows[0].split(",").map((c) => c.trim());
  let thsHTML = headerCols.map((h) => `<th>${h}</th>`).join("");

  let trsHTML = "";
  for (let i = 1; i < rows.length; i++) {
    const rowCols = rows[i].split(",").map((c) => c.trim());
    const tdsHTML = rowCols.map((c) => `<td>${c}</td>`).join("");
    trsHTML += `<tr>${tdsHTML}</tr>`;
  }

  return `
    <div class="analytical-widget-wrapper">
      <div class="analytical-table-container">
        <table class="analytical-table">
          <thead><tr>${thsHTML}</tr></thead>
          <tbody>${trsHTML}</tbody>
        </table>
      </div>
      <div class="widget-caption">Təhlil Cədvəli</div>
    </div>
  `;
}

function buildBarChartHTML(barStr) {
  if (!barStr) return "";
  const items = barStr.split("|").map((item) => {
    const parts = item.split(":").map((s) => s.trim());
    const valNum = parseFloat(parts[1]) || 0;
    return { label: parts[0] || "", rawVal: parts[1] || "0", numVal: valNum };
  });

  const maxVal = Math.max(...items.map((i) => i.numVal), 1);

  const rowsHTML = items
    .map((item) => {
      const pct = Math.min(100, Math.max(8, (item.numVal / maxVal) * 100));
      return `
      <div class="bar-chart-row">
        <div class="bar-label">${item.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="bar-value">${item.rawVal}</div>
      </div>
    `;
    })
    .join("");

  return `
    <div class="analytical-widget-wrapper">
      <div class="bar-chart-container">
        ${rowsHTML}
      </div>
      <div class="widget-caption">Müqayisəli Qrafik Göstəricisi</div>
    </div>
  `;
}

function buildDashboardHTML(dashStr) {
  if (!dashStr) return "";
  const items = dashStr.split("|").map((item) => {
    const parts = item.split(":").map((s) => s.trim());
    return { label: parts[0] || "", val: parts[1] || "-" };
  });

  const cardsHTML = items
    .map(
      (i) => `
    <div class="kpi-card">
      <div class="kpi-value">${i.val}</div>
      <div class="kpi-label">${i.label}</div>
    </div>
  `
    )
    .join("");

  return `
    <div class="analytical-widget-wrapper">
      <div class="dashboard-widget-container">
        ${cardsHTML}
      </div>
      <div class="widget-caption">Biznes KPI Metrikaları Panelİ</div>
    </div>
  `;
}

function buildPieChartHTML(pieStr) {
  if (!pieStr) return "";
  const items = pieStr.split("|").map((item) => {
    const parts = item.split(":").map((s) => s.trim());
    return { label: parts[0] || "", val: parts[1] || "-" };
  });

  const itemsHTML = items
    .map(
      (i) => `
    <div class="pie-item">
      <div class="pie-item-label">${i.label}</div>
      <div class="pie-item-val">${i.val}</div>
    </div>
  `
    )
    .join("");

  return `
    <div class="analytical-widget-wrapper">
      <div class="pie-chart-container">
        ${itemsHTML}
      </div>
      <div class="widget-caption">Nisbi Bölgü Qrafiki</div>
    </div>
  `;
}

function renderQuestion(levelCode) {
  const container = document.getElementById("question-container");
  if (!container || currentQuestions.length === 0) return;

  const q = currentQuestions[currentQuestionIndex];
  const total = currentQuestions.length;

  let questionText = (q.text || "").replace(/\\n/g, "\n").trim();
  let questionWidgetHTML = "";

  // 1. FEN (Chess)
  const fenMatch = questionText.match(/\[FEN:\s*([^\]]+)\]/i);
  if (fenMatch) {
    questionWidgetHTML = buildChessBoardHTML(fenMatch[1]);
    questionText = questionText.replace(/\[FEN:\s*([^\]]+)\]/i, "").trim();
  }

  // 2. CUBENET
  const cubeMatch = questionText.match(/\[CUBENET:\s*([^\]]+)\]/i);
  if (cubeMatch) {
    questionWidgetHTML = buildCubeNetHTML(cubeMatch[1]);
    questionText = questionText.replace(/\[CUBENET:\s*([^\]]+)\]/i, "").trim();
  }

  // 3. GRID / MATRIX
  const gridMatch = questionText.match(/\[GRID:\s*([^\]]+)\]/i);
  if (gridMatch) {
    questionWidgetHTML = buildGridHTML(gridMatch[1]);
    questionText = questionText.replace(/\[GRID:\s*([^\]]+)\]/i, "").trim();
  }

  // 4. SCALE
  const scaleMatch = questionText.match(/\[SCALE:\s*([^\]]+)\]/i);
  if (scaleMatch) {
    questionWidgetHTML = buildScaleHTML(scaleMatch[1]);
    questionText = questionText.replace(/\[SCALE:\s*([^\]]+)\]/i, "").trim();
  }

  // 5. VENN
  const vennMatch = questionText.match(/\[VENN:\s*([^\]]+)\]/i);
  if (vennMatch) {
    questionWidgetHTML = buildVennHTML(vennMatch[1]);
    questionText = questionText.replace(/\[VENN:\s*([^\]]+)\]/i, "").trim();
  }

  // 6. CLOCK
  const clockMatch = questionText.match(/\[CLOCK:\s*([^\]]+)\]/i);
  if (clockMatch) {
    questionWidgetHTML = buildClockHTML(clockMatch[1]);
    questionText = questionText.replace(/\[CLOCK:\s*([^\]]+)\]/i, "").trim();
  }

  // 7. TABLE
  const tableMatch = questionText.match(/\[TABLE:\s*([^\]]+)\]/i);
  if (tableMatch) {
    questionWidgetHTML = buildTableHTML(tableMatch[1]);
    questionText = questionText.replace(/\[TABLE:\s*([^\]]+)\]/i, "").trim();
  }

  // 8. BARCHART / LINEGRAPH
  const barMatch = questionText.match(/\[(BARCHART|LINEGRAPH):\s*([^\]]+)\]/i);
  if (barMatch) {
    questionWidgetHTML = buildBarChartHTML(barMatch[2]);
    questionText = questionText.replace(/\[(BARCHART|LINEGRAPH):\s*([^\]]+)\]/i, "").trim();
  }

  // 9. DASHBOARD
  const dashMatch = questionText.match(/\[DASHBOARD:\s*([^\]]+)\]/i);
  if (dashMatch) {
    questionWidgetHTML = buildDashboardHTML(dashMatch[1]);
    questionText = questionText.replace(/\[DASHBOARD:\s*([^\]]+)\]/i, "").trim();
  }

  // 10. PIECHART
  const pieMatch = questionText.match(/\[PIECHART:\s*([^\]]+)\]/i);
  if (pieMatch) {
    questionWidgetHTML = buildPieChartHTML(pieMatch[1]);
    questionText = questionText.replace(/\[PIECHART:\s*([^\]]+)\]/i, "").trim();
  }

  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === total - 1;

  const formattedQuestionText = questionText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .join("<br><br>");

  const isChess = !!fenMatch || (levelCode && levelCode.startsWith("S"));

  container.innerHTML = `
    <article class="question-card active" data-question-id="${q.id}">
      <span class="level-badge">${levelCode} · Sual ${currentQuestionIndex + 1}/${total}</span>
      <h3>${formattedQuestionText}</h3>
      ${questionWidgetHTML}
      <div class="answers" ${isChess ? 'style="display:none;"' : ''}>
        ${q.options
          .map(
            (opt, i) => `
          <button class="answer" type="button" data-index="${i}">${opt}</button>
        `
          )
          .join("")}
      </div>
      <div class="question-nav" style="margin-top:20px; display:flex; gap:10px; justify-content:space-between; align-items:center;">
        <button type="button" class="btn btn-outline" id="prev-question-btn" ${isFirst ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>← Əvvəlki sual</button>
        <button type="button" class="btn btn-primary" id="next-question-btn" ${isChess ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : (isLast ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '')}>Növbəti sual →</button>
      </div>
    </article>
  `;

  // Cavab butonları event
  container.querySelectorAll(".answer").forEach((btn) => {
    btn.addEventListener("click", function () {
      handleAnswerClick(this, q);
    });
  });

  // Əvvəlki sual
  const prevBtn = document.getElementById("prev-question-btn");
  if (prevBtn && !isFirst) {
    prevBtn.addEventListener("click", () => {
      currentQuestionIndex--;
      renderQuestion(levelCode);
    });
  }

  // Növbəti sual
  const nextBtn = document.getElementById("next-question-btn");
  if (nextBtn && !isLast) {
    nextBtn.addEventListener("click", () => {
      currentQuestionIndex++;
      renderQuestion(levelCode);
    });
  }

  // Interaktiv Şahmat lövhəsini aktivləşdir
  initChessBoardInteractivity(q);
}

async function handleAnswerClick(btn, question) {
  const parent = btn.closest(".question-card");
  const selectedIndex = parseInt(btn.dataset.index);

  // Bütün buttonları disable et
  parent.querySelectorAll(".answer").forEach((b) => {
    b.disabled = true;
    b.style.cursor = "default";
  });

  // Əgər login olunubsa, backend-ə göndər
  if (AuthService.isLoggedIn()) {
    const result = await ProgressService.submitAnswer(question.id, selectedIndex);
    if (result.ok && result.data) {
      const correctIdx = result.data.correctOptionIndex;

      parent.querySelectorAll(".answer").forEach((b, i) => {
        if (i === correctIdx) {
          b.classList.add("correct");
          b.textContent += " ✓";
        }
        if (i === selectedIndex && !result.data.isCorrect) {
          b.style.background = "#fce6df";
          b.style.borderColor = "#e85d3f";
          b.style.color = "#e85d3f";
          b.style.fontWeight = "700";
          b.textContent += " ✕";
        }
      });

      // Açıqlama göstər
      if (result.data.explanation) {
        const explanationDiv = document.createElement("div");
        explanationDiv.style.cssText =
          "margin-top:15px; padding:15px; background:#f0f7ff; border-radius:10px; color:#333; font-size:0.95rem;";
        explanationDiv.innerHTML = `<strong>Açıqlama:</strong> ${result.data.explanation}`;
        parent.querySelector(".answers").after(explanationDiv);
      }

      // Progress bölməsini yenilə
      loadMyProgress();
      return;
    }
  }

  // Login olunmayıbsa — sadəcə client-side yoxlama
  const correctIdx = question.correctOptionIndex;
  parent.querySelectorAll(".answer").forEach((b, i) => {
    if (i === correctIdx) {
      b.classList.add("correct");
      b.textContent += " ✓";
    }
    if (i === selectedIndex && selectedIndex !== correctIdx) {
      b.style.background = "#fce6df";
      b.style.borderColor = "#e85d3f";
      b.style.color = "#e85d3f";
      b.style.fontWeight = "700";
      b.textContent += " ✕";
    }
  });
}

// ============ TABS ============
// Tabs artıq loadModuleLevels() və initDynamicTabs() ilə idarə olunur

// ============ SMOOTH SCROLL ============

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ============ STATISTICS — dinamik ============

async function loadStatistics() {
  const statCards = document.querySelectorAll(".stat-card");
  if (statCards.length === 0) return;

  const result = await ModulesService.getAll();
  if (!result.ok || !result.data) return;

  const modules = result.data;
  const totalModules = modules.length;
  const totalQuestions = modules.reduce((sum, m) => sum + m.totalQuestions, 0);

  // Statistik kartları yenilə
  if (statCards[0]) {
    statCards[0].querySelector("strong").textContent = totalModules;
  }
  if (statCards[1]) {
    statCards[1].querySelector("strong").textContent =
      totalQuestions > 0 ? totalQuestions + "+" : "6000+";
  }
}

// ============ MY PROGRESS — şəxsi irəliləyiş ============

async function loadMyProgress() {
  const section = document.getElementById("my-progress");
  const grid = document.getElementById("progress-grid");
  if (!section || !grid) return;

  // Yalnız login olunubsa göstər
  if (!AuthService.isLoggedIn()) {
    section.style.display = "none";
    return;
  }

  const result = await ProgressService.getMyProgress();

  if (!result.ok || !result.data || result.data.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  // Modul adına görə qruplaşdır
  const grouped = {};
  result.data.forEach((p) => {
    if (!grouped[p.moduleName]) {
      grouped[p.moduleName] = [];
    }
    grouped[p.moduleName].push(p);
  });

  grid.innerHTML = "";

  Object.keys(grouped).forEach((moduleName) => {
    const levels = grouped[moduleName];

    const moduleCard = document.createElement("div");
    moduleCard.className = "progress-module-card";

    const totalCorrect = levels.reduce((s, l) => s + l.correctAnswers, 0);
    const totalAll = levels.reduce((s, l) => s + l.totalAnswers, 0);
    const totalWrong = totalAll - totalCorrect;
    const totalAccuracy = totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;

    moduleCard.innerHTML = `
      <div class="progress-module-header">
        <h3>${moduleName}</h3>
        <span class="progress-accuracy ${totalAccuracy >= 70 ? 'good' : totalAccuracy >= 40 ? 'mid' : 'low'}">${totalAccuracy}%</span>
      </div>
      <div class="progress-summary">
        <div class="progress-stat correct">
          <strong>${totalCorrect}</strong>
          <span>Doğru</span>
        </div>
        <div class="progress-stat wrong">
          <strong>${totalWrong}</strong>
          <span>Yanlış</span>
        </div>
        <div class="progress-stat total">
          <strong>${totalAll}</strong>
          <span>Cəmi</span>
        </div>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: ${totalAccuracy}%"></div>
      </div>
      <div class="progress-levels">
        ${levels
          .map((l) => {
            const wrong = l.totalAnswers - l.correctAnswers;
            return `
              <div class="progress-level-row">
                <span class="progress-level-code">${l.levelCode}</span>
                <span class="progress-level-name">${l.levelName}</span>
                <span class="progress-correct">✓ ${l.correctAnswers}</span>
                <span class="progress-wrong">✕ ${wrong}</span>
                <span class="progress-level-accuracy">${l.accuracy}%</span>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    grid.appendChild(moduleCard);
  });
}

// ============ INIT ============

document.addEventListener("DOMContentLoaded", async () => {
  updateAuthUI();
  initSmoothScroll();

  // Modulları yüklə, sonra ilk modulun suallarını göstər
  await Promise.all([
    loadModules(),
    loadStatistics(),
    loadMyProgress(),
  ]);

  // Modullar yükləndikdən sonra ilk modulu seç
  if (modulesData.length > 0) {
    const firstMod = modulesData[0];
    await selectModule(firstMod.slug, firstMod.name);
  } else {
    // Fallback: əgər API işləmirsə, statik tabları istifadə et
    initDynamicTabs();
    loadQuestions("A1");
  }
});
