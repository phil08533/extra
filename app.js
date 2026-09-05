const OPEN_LIBRARY = 'https://openlibrary.org/search.json';
const ITUNES = 'https://itunes.apple.com/search';
const COVER_FALLBACK = 'https://openlibrary.org/images/icons/avatar_book-sm.png';

const $ = (id) => document.getElementById(id);
const state = { books: [], book: null, tracks: [], index: 0 };

const STOP_WORDS = new Set(['the','and','for','with','from','that','this','into','book','books','novel','fiction','story','stories','edition','volume','a','an','of','to','in','on','by','is','as','at','or','be','it','its','his','her','their','one']);

const THEME_MAP = {
  fantasy: ['fantasy','magic','wizards','dragons','mythology','fairy tales','folklore'],
  adventure: ['adventure','exploration','travel','journey','quest','pirates'],
  mystery: ['mystery','detective','crime','suspense','investigation','thriller'],
  romance: ['romance','love','relationships','dating'],
  horror: ['horror','ghosts','supernatural','vampires','monsters','occult'],
  history: ['history','historical','war','civilization','biography','politics'],
  science: ['science','technology','space','physics','astronomy','medicine'],
  nature: ['nature','animals','environment','ecology','gardening'],
  philosophy: ['philosophy','ethics','psychology','religion','spirituality'],
  fiction: ['fiction','literary','contemporary','classic'],
  kids: ['juvenile','children','childrens','young adult','juvenile fiction']
};

const MUSIC_TERMS = {
  fantasy: ['fantasy instrumental','celtic instrumental','cinematic orchestral'],
  adventure: ['adventure instrumental','cinematic instrumental','world music'],
  mystery: ['dark ambient','mystery instrumental','noir jazz'],
  romance: ['romantic piano','love songs','acoustic love'],
  horror: ['dark ambient','horror soundtrack','gothic instrumental'],
  history: ['folk instrumental','classical strings','period music'],
  science: ['electronic ambient','space ambient','minimal electronic'],
  nature: ['nature ambient','acoustic instrumental','forest ambient'],
  philosophy: ['ambient piano','post classical','meditative ambient'],
  fiction: ['indie folk','alternative instrumental','literary soundtrack'],
  kids: ['children instrumental','family soundtrack','playful instrumental']
};

function setLoading(show) {
  $('loading').classList.toggle('hidden', !show);
}
function showError(message) {
  $('error').textContent = message;
  $('error').classList.remove('hidden');
}
function clearError() { $('error').classList.add('hidden'); }
function escapeText(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function coverUrl(coverId, size='M') { return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : COVER_FALLBACK; }

function normalizeBook(doc) {
  return {
    key: doc.key || `${doc.title}-${(doc.author_name || []).join(',')}`,
    title: doc.title || 'Untitled',
    author: (doc.author_name || ['Unknown author'])[0],
    authors: doc.author_name || [],
    coverId: doc.cover_i || null,
    subjects: (doc.subject || []).slice(0, 18),
    firstPublishYear: doc.first_publish_year || '',
    editionCount: doc.edition_count || 0
  };
}

async function searchBooks(query) {
  const url = `${OPEN_LIBRARY}?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i,subject,first_publish_year,edition_count&limit=12`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Open Library search failed.');
  const data = await response.json();
  return (data.docs || []).map(normalizeBook).filter(book => book.title);
}

function renderBookResults(books) {
  $('bookResults').innerHTML = books.map((book, i) => `
    <button class="book-result" type="button" data-index="${i}">
      <img loading="lazy" src="${coverUrl(book.coverId)}" alt="Cover of ${escapeText(book.title)}" onerror="this.src='${COVER_FALLBACK}'">
      <strong>${escapeText(book.title)}</strong>
      <span>${escapeText(book.author)}${book.firstPublishYear ? ` · ${book.firstPublishYear}` : ''}</span>
    </button>
  `).join('');
  document.querySelectorAll('.book-result').forEach(btn => btn.addEventListener('click', () => chooseBook(Number(btn.dataset.index))));
}

function uniqueTerms(book) {
  const raw = [book.title, book.author, ...book.subjects]
    .flatMap(v => String(v).toLowerCase().split(/[^a-z0-9]+/g))
    .filter(v => v.length > 3 && !STOP_WORDS.has(v));

  const themes = [];
  for (const [theme, words] of Object.entries(THEME_MAP)) {
    if (words.some(word => raw.join(' ').includes(word)) || raw.includes(theme)) themes.push(theme);
  }
  return { keywords: [...new Set(raw)].slice(0, 16), themes: themes.length ? themes : ['fiction'] };
}

async function fetchItunes(term) {
  const url = `${ITUNES}?term=${encodeURIComponent(term)}&media=music&entity=song&attribute=songTerm&limit=12&country=US`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results || [];
}

function scoreTrack(track, term, themes) {
  const haystack = `${track.trackName} ${track.artistName} ${track.collectionName} ${track.primaryGenreName || ''}`.toLowerCase();
  let score = 0;
  for (const word of term.split(/\s+/)) if (word.length > 3 && haystack.includes(word)) score += 2;
  for (const theme of themes) if (haystack.includes(theme)) score += 3;
  if (track.previewUrl) score += 1;
  return score;
}

async function buildSoundtrack(book) {
  const { keywords, themes } = uniqueTerms(book);
  $('playlistTitle').textContent = `${book.title} — original reading score`;
  $('matchExplanation').textContent = `Built from ${themes.map(t => t.replace(/^./, c => c.toUpperCase())).join(', ')} and book metadata. No AI required.`;

  const terms = [];
  themes.forEach(theme => terms.push(...(MUSIC_TERMS[theme] || [])));
  keywords.slice(0, 3).forEach(word => terms.push(word));
  const uniqueSearches = [...new Set(terms)].slice(0, 8);

  const responses = await Promise.all(uniqueSearches.map(async term => ({ term, results: await fetchItunes(term) })));
  const byId = new Map();
  for (const { term, results } of responses) {
    for (const track of results) {
      if (!track.previewUrl || !track.trackId) continue;
      const score = scoreTrack(track, term, themes);
      const existing = byId.get(track.trackId);
      if (!existing || score > existing.score) byId.set(track.trackId, { track, score, term });
    }
  }

  const tracks = [...byId.values()]
    .sort((a,b) => b.score - a.score)
    .slice(0, 18)
    .map(x => x.track);

  if (!tracks.length) throw new Error('No playable music previews were found. Try another book or rebuild the soundtrack.');
  return tracks;
}

function renderWorkspace(book) {
  $('bookCover').src = coverUrl(book.coverId, 'L');
  $('bookCover').alt = `Cover of ${book.title}`;
  $('bookCover').onerror = () => $('bookCover').src = COVER_FALLBACK;
  $('bookTitle').textContent = book.title;
  $('bookAuthor').textContent = `by ${book.author}`;
  $('bookDescription').textContent = 'The soundtrack engine uses the book’s title, author, subjects, and publication metadata to choose musical directions.';
  const tags = [...new Set(book.subjects)].slice(0, 9);
  $('subjectTags').innerHTML = tags.length ? tags.map(s => `<span class="tag">${escapeText(s)}</span>`).join('') : '<span class="tag">fiction</span>';
  $('workspace').classList.remove('hidden');
  $('resultsSection').classList.add('hidden');
  window.scrollTo({top: $('workspace').offsetTop - 20, behavior:'smooth'});
}

function renderPlaylist() {
  $('playlist').innerHTML = state.tracks.map((track, i) => `
    <button class="track ${i === state.index ? 'active' : ''}" type="button" data-index="${i}">
      <span class="number">${String(i+1).padStart(2,'0')}</span>
      <img loading="lazy" src="${escapeText(track.artworkUrl100 || COVER_FALLBACK)}" alt="">
      <span><strong>${escapeText(track.trackName || 'Untitled')}</strong><span>${escapeText(track.artistName || '')}</span></span>
    </button>
  `).join('');
  document.querySelectorAll('.track').forEach(btn => btn.addEventListener('click', () => selectTrack(Number(btn.dataset.index), true)));
}

function selectTrack(index, autoplay=false) {
  if (!state.tracks.length) return;
  state.index = (index + state.tracks.length) % state.tracks.length;
  const track = state.tracks[state.index];
  $('trackName').textContent = track.trackName || 'Untitled';
  $('trackArtist').textContent = track.artistName || '';
  $('trackArtwork').src = track.artworkUrl100 || COVER_FALLBACK;
  $('trackArtwork').alt = `${track.trackName || 'Track'} artwork`;
  $('audio').src = track.previewUrl;
  $('player').classList.remove('hidden');
  document.querySelectorAll('.track').forEach((el, i) => el.classList.toggle('active', i === state.index));
  localStorage.setItem('readsound-session', JSON.stringify({book: state.book, tracks: state.tracks, index: state.index}));
  if (autoplay) $('audio').play().catch(() => {});
}

async function chooseBook(index) {
  state.book = state.books[index];
  renderWorkspace(state.book);
  clearError();
  setLoading(true);
  try {
    state.tracks = await buildSoundtrack(state.book);
    state.index = 0;
    renderPlaylist();
    selectTrack(0, false);
  } catch (error) {
    showError(error.message || 'Something went wrong while building the soundtrack.');
  } finally {
    setLoading(false);
  }
}

async function rebuild() {
  if (!state.book) return;
  clearError();
  setLoading(true);
  $('playlist').innerHTML = '';
  try {
    state.tracks = await buildSoundtrack(state.book);
    state.index = Math.floor(Math.random() * state.tracks.length);
    renderPlaylist();
    selectTrack(state.index, false);
  } catch (error) {
    showError(error.message || 'Could not rebuild the soundtrack.');
  } finally { setLoading(false); }
}

$('searchForm').addEventListener('submit', async event => {
  event.preventDefault();
  clearError();
  const query = $('bookQuery').value.trim();
  if (!query) return;
  $('resultsSection').classList.add('hidden');
  setLoading(true);
  $('loading').classList.remove('hidden');
  try {
    state.books = await searchBooks(query);
    if (!state.books.length) throw new Error('No books found. Try a different title or author.');
    $('resultCount').textContent = `${state.books.length} matches`;
    renderBookResults(state.books);
    $('resultsSection').classList.remove('hidden');
    window.scrollTo({top: $('resultsSection').offsetTop - 20, behavior:'smooth'});
  } catch (error) { showError(error.message || 'Book search failed.'); $('resultsSection').classList.remove('hidden'); }
  finally { setLoading(false); }
});

$('prevButton').addEventListener('click', () => selectTrack(state.index - 1, true));
$('nextButton').addEventListener('click', () => selectTrack(state.index + 1, true));
$('shuffleButton').addEventListener('click', () => {
  state.tracks.sort(() => Math.random() - 0.5);
  state.index = 0;
  renderPlaylist();
  selectTrack(0, false);
});
$('rebuildButton').addEventListener('click', rebuild);
$('audio').addEventListener('ended', () => selectTrack(state.index + 1, true));

(function restoreSession(){
  try {
    const saved = JSON.parse(localStorage.getItem('readsound-session') || 'null');
    if (!saved?.book || !Array.isArray(saved.tracks) || !saved.tracks.length) return;
    state.book = saved.book; state.tracks = saved.tracks; state.index = saved.index || 0;
    renderWorkspace(state.book); renderPlaylist(); selectTrack(state.index, false);
  } catch (_) {}
})();
