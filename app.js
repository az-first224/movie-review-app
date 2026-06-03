const STORAGE_KEY = "videoReviewLog.records";
const CATEGORY_TAGS = ["映画", "漫画", "ドラマ", "アニメ", "ゲーム", "小説", "音楽"];
const GENRES = [
  "ヒューマンドラマ",
  "恋愛",
  "コメディ",
  "ミステリー",
  "サスペンス",
  "ホラー",
  "SF",
  "ファンタジー",
  "アクション",
  "アドベンチャー",
  "ドキュメンタリー",
  "音楽",
  "日常",
  "青春"
];

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `review-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const sampleReviews = [
  {
    id: createId(),
    title: "静かな軌道",
    director: "青井 真",
    tagline: "孤独な宇宙船で、記憶だけが灯りになる。",
    cast: "水原 凛, 高瀬 航",
    genres: ["SF"],
    rating: 5,
    comment: "余白の多い演出と音の使い方が印象的。終盤の小さな表情の変化で物語全体が締まる。",
    tags: ["映画"],
    createdAt: "2026-05-20T12:15:00.000Z",
    updatedAt: "2026-05-20T12:15:00.000Z"
  },
  {
    id: createId(),
    title: "路地裏の季節",
    director: "北村 遥",
    tagline: "変わらない街で、変わっていく人たち。",
    cast: "佐伯 奈緒, 三浦 圭",
    genres: ["日常"],
    rating: 4,
    comment: "会話劇として見やすく、登場人物の距離感が自然。派手さはないが、見終わったあとに残る。",
    tags: ["ドラマ"],
    createdAt: "2026-05-24T09:40:00.000Z",
    updatedAt: "2026-05-25T10:05:00.000Z"
  },
  {
    id: createId(),
    title: "フレームの向こう側",
    director: "西園 透",
    tagline: "撮ることは、見つめ直すこと。",
    cast: "語り: 西園 透",
    genres: ["ドキュメンタリー"],
    rating: 3,
    comment: "題材は面白い。中盤の構成が少し散らかるが、インタビューの熱量で最後まで見られる。",
    tags: ["映画"],
    createdAt: "2026-05-30T14:30:00.000Z",
    updatedAt: "2026-05-30T14:30:00.000Z"
  }
];

const elements = {
  form: document.querySelector("#reviewForm"),
  reviewId: document.querySelector("#reviewId"),
  title: document.querySelector("#title"),
  director: document.querySelector("#director"),
  tagline: document.querySelector("#tagline"),
  cast: document.querySelector("#cast"),
  category: document.querySelector("#category"),
  genreChoices: document.querySelector("#genreChoices"),
  rating: document.querySelector("#rating"),
  ratingNumber: document.querySelector("#ratingNumber"),
  ratingPreview: document.querySelector("#ratingPreview"),
  ratingValue: document.querySelector("#ratingValue"),
  comment: document.querySelector("#comment"),
  submitButton: document.querySelector("#submitButton"),
  resetButton: document.querySelector("#resetButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  keywordFilter: document.querySelector("#keywordFilter"),
  ratingFilter: document.querySelector("#ratingFilter"),
  genreFilter: document.querySelector("#genreFilter"),
  tagFilter: document.querySelector("#tagFilter"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  reviewList: document.querySelector("#reviewList"),
  emptyMessage: document.querySelector("#emptyMessage"),
  reviewCount: document.querySelector("#reviewCount"),
  filteredCount: document.querySelector("#filteredCount")
};

let reviews = loadReviews();
saveReviews();

function loadReviews() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReviews));
    return [...sampleReviews];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeReview) : [];
  } catch {
    return [];
  }
}

function normalizeReview(review) {
  const source = review || {};
  const categories = Array.isArray(source.tags)
    ? source.tags.filter((tag) => CATEGORY_TAGS.includes(tag))
    : [];

  return {
    ...source,
    id: source.id || createId(),
    title: source.title || "",
    director: source.director || "",
    tagline: source.tagline || "",
    cast: source.cast || "",
    rating: normalizeRating(source.rating),
    comment: source.comment || "",
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt || source.createdAt || new Date().toISOString(),
    genres: normalizeGenres(source),
    tags: categories.length > 0 ? [categories[0]] : []
  };
}

function normalizeGenres(review) {
  if (Array.isArray(review.genres)) {
    return review.genres.filter((genre) => GENRES.includes(genre));
  }

  if (GENRES.includes(review.genre)) {
    return [review.genre];
  }

  return [];
}

function saveReviews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function normalizeText(value) {
  return value.trim();
}

function normalizeRating(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(5, Math.max(0, Math.round(number * 10) / 10));
}

function getSelectedGenres() {
  return [...elements.genreChoices.querySelectorAll("input:checked")].map((input) => input.value);
}

function setSelectedGenres(genres) {
  elements.genreChoices.querySelectorAll("input").forEach((input) => {
    input.checked = genres.includes(input.value);
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}

function renderStars(rating) {
  const normalizedRating = normalizeRating(rating);
  const width = (normalizedRating / 5) * 100;

  return `
    <span class="stars" aria-label="${normalizedRating.toFixed(1)}つ星">
      <span class="star-base">★★★★★</span>
      <span class="star-fill" style="width: ${width}%;">★★★★★</span>
    </span>
  `;
}

function updateRatingInput(value) {
  const rating = normalizeRating(value);
  const displayValue = rating.toFixed(1);
  const width = (rating / 5) * 100;

  elements.rating.value = String(rating);
  elements.ratingNumber.value = displayValue;
  elements.ratingValue.value = displayValue;
  elements.ratingValue.textContent = displayValue;
  elements.ratingPreview.setAttribute("aria-label", `${displayValue}つ星`);
  elements.ratingPreview.querySelector(".star-fill").style.width = `${width}%`;
}

function getFilteredReviews() {
  const keyword = elements.keywordFilter.value.trim().toLowerCase();
  const rating = elements.ratingFilter.value;
  const genre = elements.genreFilter.value;
  const tag = elements.tagFilter.value;

  return reviews
    .filter((review) => {
      const searchable = [
        review.title,
        review.director,
        review.cast,
        review.genres.join(" "),
        review.comment,
        review.tags.join(" ")
      ].join(" ").toLowerCase();

      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesRating =
        rating === "" ||
        (rating === "0" ? review.rating === 0 : review.rating >= Number(rating));
      const matchesGenre = !genre || review.genres.includes(genre);
      const matchesTag = !tag || review.tags.includes(tag);

      return matchesKeyword && matchesRating && matchesGenre && matchesTag;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function renderGenreOptions() {
  const selected = elements.genreFilter.value;

  elements.genreFilter.innerHTML = '<option value="">すべて</option>';
  GENRES.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    elements.genreFilter.append(option);
  });

  if (GENRES.includes(selected)) {
    elements.genreFilter.value = selected;
  }
}

function renderTagOptions() {
  const selected = elements.tagFilter.value;

  elements.tagFilter.innerHTML = '<option value="">すべて</option>';
  CATEGORY_TAGS.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    elements.tagFilter.append(option);
  });

  if (CATEGORY_TAGS.includes(selected)) {
    elements.tagFilter.value = selected;
  }
}

function renderReviews() {
  reviews = reviews.map(normalizeReview);
  const filtered = getFilteredReviews();

  elements.reviewCount.textContent = `${reviews.length}件`;
  elements.filteredCount.textContent = `${filtered.length}件表示`;
  elements.emptyMessage.classList.toggle("hidden", filtered.length > 0);
  elements.reviewList.innerHTML = "";

  filtered.forEach((review) => {
    const article = document.createElement("article");
    article.className = "review-card";
    article.innerHTML = `
      <div>
        <div class="review-title-row">
          <h3 class="review-title">${escapeHtml(review.title)}</h3>
          ${renderStars(review.rating)}
          <span class="rating-score">${normalizeRating(review.rating).toFixed(1)}</span>
        </div>
        ${review.tagline ? `<p class="tagline">${escapeHtml(review.tagline)}</p>` : ""}
        <div class="meta-grid">
          <div>監督: ${escapeHtml(review.director || "未入力")}</div>
          <div>出演者: ${escapeHtml(review.cast || "未入力")}</div>
          <div>ジャンル: ${escapeHtml(review.genres.join(", ") || "未選択")}</div>
        </div>
        ${review.comment ? `<p class="comment">${escapeHtml(review.comment)}</p>` : ""}
        <div class="tag-list">
          ${review.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="timestamps">
          登録: ${formatDate(review.createdAt)} / 更新: ${formatDate(review.updatedAt)}
        </div>
      </div>
      <div class="card-actions">
        <button class="secondary-button" type="button" data-action="edit" data-id="${review.id}">編集</button>
        <button class="danger-button" type="button" data-action="delete" data-id="${review.id}">削除</button>
      </div>
    `;
    article.querySelector('[data-action="edit"]').addEventListener("click", (event) => {
      event.stopPropagation();
      fillForm(review);
    });
    article.querySelector('[data-action="delete"]').addEventListener("click", (event) => {
      event.stopPropagation();
      deleteReview(review.id);
    });
    elements.reviewList.append(article);
  });
}

function resetForm() {
  elements.form.reset();
  elements.reviewId.value = "";
  elements.submitButton.textContent = "登録する";
  elements.cancelEditButton.classList.add("hidden");
  document.querySelector("#formTitle").textContent = "レビュー入力";
  elements.category.value = "";
  updateRatingInput(0);
  setSelectedGenres([]);
}

function fillForm(review) {
  const normalized = normalizeReview(review);

  elements.reviewId.value = normalized.id;
  elements.title.value = normalized.title;
  elements.director.value = normalized.director;
  elements.tagline.value = normalized.tagline;
  elements.cast.value = normalized.cast;
  elements.category.value = normalized.tags[0] || "";
  elements.comment.value = normalized.comment;
  updateRatingInput(normalized.rating);
  setSelectedGenres(normalized.genres);
  elements.submitButton.textContent = "更新する";
  elements.cancelEditButton.classList.remove("hidden");
  document.querySelector("#formTitle").textContent = "レビュー編集中";
  window.scrollTo({ top: 0, behavior: "smooth" });
  elements.title.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const now = new Date().toISOString();
  const id = elements.reviewId.value;
  const existing = findReviewById(id);

  const reviewData = {
    id: id || createId(),
    title: normalizeText(elements.title.value),
    director: normalizeText(elements.director.value),
    tagline: normalizeText(elements.tagline.value),
    cast: normalizeText(elements.cast.value),
    genres: getSelectedGenres(),
    rating: normalizeRating(elements.rating.value),
    comment: normalizeText(elements.comment.value),
    tags: elements.category.value ? [elements.category.value] : [],
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };

  if (existing) {
    reviews = reviews.map((review) => (String(review.id) === String(id) ? reviewData : review));
  } else {
    reviews = [reviewData, ...reviews];
  }

  saveReviews();
  reviews = reviews.map(normalizeReview);
  resetForm();
  renderTagOptions();
  renderReviews();
}

function findReviewById(id) {
  return reviews.find((item) => String(item.id) === String(id));
}

function editReview(id) {
  const review = findReviewById(id);
  if (!review) return;
  fillForm(review);
}

function deleteReview(id) {
  const review = findReviewById(id);
  if (!review) return;

  const shouldDelete = confirm(`「${review.title}」を削除しますか？`);
  if (!shouldDelete) return;

  reviews = reviews.filter((item) => String(item.id) !== String(id));
  saveReviews();
  renderTagOptions();
  renderReviews();

  if (String(elements.reviewId.value) === String(id)) {
    resetForm();
  }
}

function clearFilters() {
  elements.keywordFilter.value = "";
  elements.ratingFilter.value = "";
  elements.genreFilter.value = "";
  elements.tagFilter.value = "";
  renderReviews();
}

elements.rating.addEventListener("input", () => updateRatingInput(elements.rating.value));
elements.ratingNumber.addEventListener("input", () => {
  if (elements.ratingNumber.value === "") return;
  updateRatingInput(elements.ratingNumber.value);
});

elements.form.addEventListener("submit", handleSubmit);
elements.form.addEventListener("reset", () => {
  setTimeout(resetForm, 0);
});
elements.cancelEditButton.addEventListener("click", resetForm);
elements.clearFiltersButton.addEventListener("click", clearFilters);
elements.keywordFilter.addEventListener("input", renderReviews);
elements.ratingFilter.addEventListener("change", renderReviews);
elements.genreFilter.addEventListener("change", renderReviews);
elements.tagFilter.addEventListener("change", renderReviews);

renderGenreOptions();
renderTagOptions();
updateRatingInput(0);
renderReviews();
