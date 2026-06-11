const CATEGORY_TAGS = ["映画", "漫画", "ドラマ", "アニメ", "ゲーム", "スポーツ", "小説", "音楽"];
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
  filteredCount: document.querySelector("#filteredCount"),
  formTitle: document.querySelector("#formTitle"),
  siteLogoutButton: document.querySelector("#siteLogoutButton")
};

let reviews = [];
let supabaseClient = null;

function getSupabaseConfig() {
  return window.REVIEW_APP_SUPABASE || {};
}

function hasSupabaseConfig(config) {
  return Boolean(config.url && config.anonKey);
}

function createSupabaseClient() {
  const config = getSupabaseConfig();

  if (!window.supabase || !hasSupabaseConfig(config)) {
    renderSetupMessage();
    setFormDisabled(true);
    return null;
  }

  return window.supabase.createClient(config.url, config.anonKey);
}

function normalizeReview(row) {
  const source = row || {};
  const category = CATEGORY_TAGS.includes(source.category)
    ? source.category
    : Array.isArray(source.tags) && CATEGORY_TAGS.includes(source.tags[0])
      ? source.tags[0]
      : "";

  return {
    id: source.id || "",
    title: source.title || "",
    director: source.director || "",
    tagline: source.tagline || "",
    cast: source.cast_names || source.cast || "",
    rating: normalizeRating(source.rating),
    comment: source.comment || "",
    category,
    genres: normalizeGenres(source),
    createdAt: source.created_at || source.createdAt || new Date().toISOString(),
    updatedAt: source.updated_at || source.updatedAt || source.created_at || new Date().toISOString()
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

function toSupabasePayload() {
  return {
    title: normalizeText(elements.title.value),
    director: normalizeText(elements.director.value),
    tagline: normalizeText(elements.tagline.value),
    cast_names: normalizeText(elements.cast.value),
    rating: normalizeRating(elements.rating.value),
    category: elements.category.value || null,
    genres: getSelectedGenres(),
    comment: normalizeText(elements.comment.value)
  };
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
  return String(value).replace(/[&<>"']/g, (char) => {
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

function setFormDisabled(disabled) {
  elements.form.querySelectorAll("input, select, textarea, button").forEach((control) => {
    control.disabled = disabled;
  });
}

function setBusy(isBusy) {
  elements.submitButton.disabled = isBusy;
  elements.submitButton.textContent = isBusy
    ? "保存中..."
    : elements.reviewId.value
      ? "更新する"
      : "登録する";
}

function getFilteredReviews() {
  const keyword = elements.keywordFilter.value.trim().toLowerCase();
  const rating = elements.ratingFilter.value;
  const genre = elements.genreFilter.value;
  const category = elements.tagFilter.value;

  return reviews
    .filter((review) => {
      const searchable = [
        review.title,
        review.director,
        review.cast,
        review.category,
        review.genres.join(" "),
        review.comment
      ].join(" ").toLowerCase();

      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesRating =
        rating === "" ||
        (rating === "0" ? review.rating === 0 : review.rating >= Number(rating));
      const matchesGenre = !genre || review.genres.includes(genre);
      const matchesCategory = !category || review.category === category;

      return matchesKeyword && matchesRating && matchesGenre && matchesCategory;
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
          <div>カテゴリー: ${escapeHtml(review.category || "未選択")}</div>
          <div>ジャンル: ${escapeHtml(review.genres.join(", ") || "未選択")}</div>
        </div>
        ${review.comment ? `<p class="comment">${escapeHtml(review.comment)}</p>` : ""}
        <div class="tag-list">
          ${review.category ? `<span class="tag">${escapeHtml(review.category)}</span>` : ""}
          ${review.genres.map((genre) => `<span class="tag">${escapeHtml(genre)}</span>`).join("")}
        </div>
        <div class="timestamps">
          登録: ${formatDate(review.createdAt)} / 更新: ${formatDate(review.updatedAt)}
        </div>
      </div>
      <div class="card-actions">
        <button class="secondary-button" type="button" data-action="edit">編集</button>
        <button class="danger-button" type="button" data-action="delete">削除</button>
      </div>
    `;
    article.querySelector('[data-action="edit"]').addEventListener("click", () => {
      fillForm(review);
    });
    article.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteReview(review);
    });
    elements.reviewList.append(article);
  });
}

function renderLoadingMessage() {
  elements.reviewList.innerHTML = '<p class="empty-message">Supabaseから読み込み中です。</p>';
  elements.emptyMessage.classList.add("hidden");
}

function renderSetupMessage() {
  elements.reviewCount.textContent = "0件";
  elements.filteredCount.textContent = "";
  elements.emptyMessage.classList.add("hidden");
  elements.reviewList.innerHTML = `
    <p class="empty-message">
      Supabase設定がありません。READMEを参考に supabase-config.js を作成してください。
    </p>
  `;
}

function renderErrorMessage(error) {
  elements.reviewList.innerHTML = `
    <p class="empty-message">
      データの読み込みに失敗しました。Supabase設定、SQL、RLSポリシーを確認してください。<br>
      ${escapeHtml(error.message || String(error))}
    </p>
  `;
  elements.emptyMessage.classList.add("hidden");
}

function resetForm() {
  elements.form.reset();
  elements.reviewId.value = "";
  elements.submitButton.textContent = "登録する";
  elements.cancelEditButton.classList.add("hidden");
  elements.formTitle.textContent = "レビュー入力";
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
  elements.category.value = normalized.category;
  elements.comment.value = normalized.comment;
  updateRatingInput(normalized.rating);
  setSelectedGenres(normalized.genres);
  elements.submitButton.textContent = "更新する";
  elements.cancelEditButton.classList.remove("hidden");
  elements.formTitle.textContent = "レビュー編集中";
  window.scrollTo({ top: 0, behavior: "smooth" });
  elements.title.focus();
}

async function loadReviews() {
  if (!supabaseClient) return;

  renderLoadingMessage();

  const { data, error } = await supabaseClient
    .from("review_records")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    renderErrorMessage(error);
    return;
  }

  reviews = (data || []).map(normalizeReview);
  renderTagOptions();
  renderReviews();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) return;

  const id = elements.reviewId.value;
  const payload = toSupabasePayload();

  setBusy(true);

  const response = id
    ? await supabaseClient
      .from("review_records")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    : await supabaseClient
      .from("review_records")
      .insert(payload)
      .select()
      .single();

  setBusy(false);

  if (response.error) {
    alert(`保存に失敗しました: ${response.error.message}`);
    return;
  }

  resetForm();
  await loadReviews();
}

async function deleteReview(review) {
  if (!supabaseClient) return;

  const shouldDelete = confirm(`「${review.title}」を削除しますか？`);
  if (!shouldDelete) return;

  const { error } = await supabaseClient
    .from("review_records")
    .delete()
    .eq("id", review.id);

  if (error) {
    alert(`削除に失敗しました: ${error.message}`);
    return;
  }

  if (elements.reviewId.value === review.id) {
    resetForm();
  }

  await loadReviews();
}

function clearFilters() {
  elements.keywordFilter.value = "";
  elements.ratingFilter.value = "";
  elements.genreFilter.value = "";
  elements.tagFilter.value = "";
  renderReviews();
}

async function logoutSite() {
  elements.siteLogoutButton.disabled = true;

  try {
    await fetch("/api/auth", { method: "DELETE" });
  } finally {
    window.location.replace("/login.html");
  }
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
elements.siteLogoutButton.addEventListener("click", logoutSite);

renderGenreOptions();
renderTagOptions();
updateRatingInput(0);
supabaseClient = createSupabaseClient();
loadReviews();
