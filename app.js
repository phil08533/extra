const els = {
  form: document.querySelector('#search-form'), input: document.querySelector('#book-search'), status: document.querySelector('#status'),
  results: document.querySelector('#results'), grid: document.querySelector('#book-grid'), count: document.querySelector('#result-count'),
  soundtrack: document.querySelector('#soundtrack'), title: document.querySelector('#selected-title'), meta: document.querySelector('#selected-meta'),
  moods: document.querySelector('#mood-strip'), tracks: document.querySelector('#tracks'), rebuild: document.querySelector('#rebuild'),
  audio: document.querySelector('#audio'), play: document.querySelector('#play'), prev: document.querySelector('#prev'), next: document.querySelector('#next'),
  art: document.querySelector('#now-art'), nowTrack: document.querySelector('#now-track'), nowArtist: document.querySelector('#now-artist')
};

const state = { book: null, tracks: [], current: -1, musicCache: new Map(), bookCache: new Map() };
const THEME_TO_GENRES = {
  fantasy:['soundtrack','classical','world','folk','new age'], adventure:['soundtrack','alternative','rock','electronic'], mystery:['ambient','electronic','jazz','classical'], thriller:['electronic','ambient','alternative','soundtrack'], horror:['soundtrack','metal','ambient','electronic'], romance:['singer/songwriter','pop','jazz','classical'], love:['pop','singer/songwriter','jazz'], war:['soundtrack','classical','alternative','rock'], history:['classical','folk','world','soundtrack'], historical:['classical','folk','world','soundtrack'], mythology:['world','folk','soundtrack','classical'], magic:['new age','soundtrack','electronic','classical'], science:['electronic','ambient','classical'], science_fiction:['electronic','ambient','soundtrack','alternative'], dystopia:['electronic','alternative','ambient','rock'], nature:['new age','folk','ambient','world'], travel:['world','folk','alternative','electronic'], survival:['rock','ambient','soundtrack','alternative'], coming_of_age:['alternative','indie rock','pop','singer/songwriter'], friendship:['indie rock','pop','alternative'], family:['singer/songwriter','pop','classical'], philosophy:['ambient','classical','jazz'], religion:['world','classical','ambient'], politics:['alternative','rock','folk','classical'], crime:['jazz','electronic','soundtrack','hip-hop/rap'], detective:['jazz','soundtrack','ambient'], school:['pop','alternative','indie rock'], humor:['pop','alternative','jazz'], comedy:['pop','jazz','alternative'], literary:['classical','jazz','ambient','singer/songwriter'], poetry:['ambient','classical','jazz','singer/songwriter']
};
const FALLBACK_GENRES=['ambient','classical','soundtrack','indie rock'];

function setStatus(msg='',error=false){els.status.textContent=msg;els.status.classList.toggle('error',error)}
function esc(s=''){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function coverUrl(id){return id?`https://covers.openlibrary.org/b/id/${id}-M.jpg`:''}

async function openLibrarySearch(q){
  const key=q.trim().toLowerCase();if(state.bookCache.has(key))return state.bookCache.get(key);
  const url=`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,first_publish_year,cover_i,subject,subject_key&limit=8`;
  const res=await fetch(url,{headers:{Accept:'application/json'}});if(!res.ok)throw new Error('Open Library search failed.');
  const data=await res.json();const docs=(data.docs||[]).filter(x=>x.title);state.bookCache.set(key,docs);return docs;
}

function renderBooks(books){
  els.grid.innerHTML='';els.count.textContent=`${books.length} found`;els.results.hidden=false;
  books.forEach(book=>{const card=document.createElement('article');card.className='book';const btn=document.createElement('button');btn.type='button';
    const cover=coverUrl(book.cover_i);btn.innerHTML=`<div class="cover">${cover?`<img loading="lazy" src="${cover}" alt="Cover of ${esc(book.title)}">`:`<div class="cover-fallback">${esc(book.title.slice(0,28))}</div>`}</div><div class="book-info"><div class="book-title">${esc(book.title)}</div><div class="book-author">${esc((book.author_name||[]).slice(0,2).join(', '))}</div><div class="book-year">${book.first_publish_year||'Unknown year'}</div></div>`;
    btn.addEventListener('click',()=>selectBook(book));card.appendChild(btn);els.grid.appendChild(card);
  });
}

function bookThemes(book){
  const raw=[...(book.subject_key||[]),...(book.subject||[])].map(x=>String(x).toLowerCase().replace(/[^a-z0-9_ ]/g,'_'));
  return [...new Set(raw.map(x=>x.replace(/\s+/g,'_')).filter(Boolean))].slice(0,18);
}

function chooseGenres(themes,book){
  const scores=new Map();
  themes.forEach(theme=>{
    Object.entries(THEME_TO_GENRES).forEach(([needle,genres])=>{
      if(theme.includes(needle)) genres.forEach((g,idx)=>scores.set(g,(scores.get(g)||0)+(5-idx)));
    });
  });
  const text=`${book.title} ${(book.author_name||[]).join(' ')}`.toLowerCase();
  if(/lord|hobbit|tolkien|dragon|wizard/.test(text))['folk','soundtrack','classical'].forEach(g=>scores.set(g,(scores.get(g)||0)+6));
  if(/dune|foundation|mars|robot|galaxy|space/.test(text))['electronic','ambient','soundtrack'].forEach(g=>scores.set(g,(scores.get(g)||0)+6));
  const ranked=[...scores.entries()].sort((a,b)=>b[1]-a[1]).map(([g])=>g);return [...new Set([...ranked,...FALLBACK_GENRES])].slice(0,5);
}

async function iTunesSearch(term){
  const key=term.toLowerCase();if(state.musicCache.has(key))return state.musicCache.get(key);
  const params=new URLSearchParams({term,media:'music',entity:'song',country:'US',limit:'20',explicit:'No'});
  const res=await fetch(`https://itunes.apple.com/search?${params.toString()}`);if(!res.ok)throw new Error('Music search failed.');
  const data=await res.json();const tracks=(data.results||[]).filter(t=>t.previewUrl&&t.trackName&&t.artistName);state.musicCache.set(key,tracks);return tracks;
}

function scoreTrack(track,themes,genres){
  const hay=`${track.trackName} ${track.artistName} ${track.collectionName} ${track.primaryGenreName}`.toLowerCase();let score=0;
  themes.forEach(t=>t.replace(/_/g,' ').split(' ').filter(x=>x.length>3).forEach(p=>{if(hay.includes(p))score+=2}));
  const pg=(track.primaryGenreName||'').toLowerCase();genres.forEach((g,i)=>{if(pg.includes(g)||g.includes(pg))score+=Math.max(1,5-i)});
  if(/instrumental|ambient|soundtrack|classical|folk/.test(pg))score+=1;return score;
}

async function buildSoundtrack(book){
  setStatus('Building your soundtrack…');const themes=bookThemes(book);const genres=chooseGenres(themes,book);
  // Keep the client-side request budget small: five bounded iTunes searches per book.
  const queries=[book.title,...genres.slice(0,4)];const buckets=await Promise.all(queries.map(q=>iTunesSearch(q).catch(()=>[])));
  const unique=new Map();buckets.flat().forEach(t=>{if(!unique.has(t.trackId))unique.set(t.trackId,t)});
  let tracks=[...unique.values()].map(t=>({...t,score:scoreTrack(t,themes,genres)})).sort((a,b)=>b.score-a.score).slice(0,14);
  if(!tracks.length)throw new Error('No music previews came back. Try another book.');
  state.book=book;state.tracks=tracks;state.current=-1;
  els.title.textContent=book.title;els.meta.textContent=`${(book.author_name||[]).slice(0,2).join(', ')||'Unknown author'} · ${book.first_publish_year||'year unknown'}`;
  els.moods.innerHTML=(themes.length?themes.slice(0,8):['story']).map(t=>`<span class="mood">${esc(t.replace(/_/g,' '))}</span>`).join('');renderTracks();els.soundtrack.hidden=false;els.soundtrack.scrollIntoView({behavior:'smooth',block:'start'});setStatus('');
}

function renderTracks(){
  els.tracks.innerHTML=state.tracks.map((t,i)=>`<div class="track ${i===state.current?'playing':''}" data-i="${i}"><div class="track-num">${String(i+1).padStart(2,'0')}</div><div class="track-copy"><div class="track-title">${esc(t.trackName)}</div><div class="track-artist">${esc(t.artistName)} · ${esc(t.primaryGenreName||'music')}</div></div><button class="track-play" type="button">Preview</button></div>`).join('');
  els.tracks.querySelectorAll('.track').forEach(row=>row.querySelector('button').addEventListener('click',()=>playIndex(Number(row.dataset.i))));
}
function updatePlayer(){
  const t=state.tracks[state.current];if(!t){els.nowTrack.textContent='Choose a track';els.nowArtist.textContent='30-second sample';els.art.textContent='♪';return}
  els.nowTrack.textContent=t.trackName;els.nowArtist.textContent=t.artistName;els.art.innerHTML=t.artworkUrl100?`<img src="${t.artworkUrl100}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`:'♪';renderTracks();
}
function playIndex(i){const t=state.tracks[i];if(!t)return;state.current=i;els.audio.src=t.previewUrl;els.audio.play().catch(()=>{});els.play.textContent='❚❚';updatePlayer()}
function pause(){els.audio.pause();els.play.textContent='▶'}
function nextTrack(){if(state.tracks.length)playIndex((state.current+1)%state.tracks.length)}
function selectBook(book){buildSoundtrack(book).catch(err=>setStatus(err.message||'Could not build soundtrack.',true))}

els.audio.addEventListener('ended',nextTrack);els.play.addEventListener('click',()=>{if(!state.tracks.length)return;if(els.audio.paused)playIndex(state.current>=0?state.current:0);else pause()});
els.next.addEventListener('click',nextTrack);els.prev.addEventListener('click',()=>{if(state.tracks.length)playIndex((state.current-1+state.tracks.length)%state.tracks.length)});
els.form.addEventListener('submit',async e=>{e.preventDefault();const q=els.input.value.trim();if(!q)return;setStatus('Searching Open Library…');els.results.hidden=true;els.soundtrack.hidden=true;try{const books=await openLibrarySearch(q);if(!books.length)throw new Error('No books found.');renderBooks(books);setStatus('')}catch(err){setStatus(err.message||'Something went wrong.',true)}});
els.rebuild.addEventListener('click',()=>state.book&&buildSoundtrack(state.book).catch(err=>setStatus(err.message||'Could not rebuild soundtrack.',true)));
if(location.hash.length>1)els.input.value=decodeURIComponent(location.hash.slice(1)).replace(/\+/g,' ');
