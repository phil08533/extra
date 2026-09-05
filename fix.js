(() => {
  const NOISE_WORDS = new Set([
    'british','english','irish','american','canadian','australian','scottish','welsh',
    'french','german','european','literature','literary','fiction','fictional',
    'criticism','critic','textual','text','language','languages','history','century',
    'twentieth','nineteenth','twentyfirst','authors','author','works','working',
    'accessible','protected','da','general'
  ]);

  const NOISE_PHRASES = [
    /history[_ ]and[_ ]criticism/i,
    /literature[_ ]history/i,
    /literary[_ ]criticism/i,
    /criticism[_ ]textual/i,
    /fictional[_ ]works/i,
    /works[_ ]by[_ ]one[_ ]author/i,
    /language[_ ]and[_ ]literature/i,
    /british[_ ]and[_ ]irish/i,
    /english[_ ]literature/i,
    /fantasy[_ ]literature/i,
    /[0-9]+th[_ ]century/i,
    /[0-9]+st[_ ]century/i,
    /[0-9]+nd[_ ]century/i,
    /[0-9]+rd[_ ]century/i
  ];

  const GENRES = new Set([
    'ambient','classical','soundtrack','folk','world','jazz','electronic',
    'alternative','rock','pop','metal','new age','singer/songwriter',
    'indie rock','hip-hop/rap'
  ]);

  function isNoise(value) {
    const normalized = String(value || '').toLowerCase().trim().replace(/\s+/g, '_');
    return !normalized || NOISE_WORDS.has(normalized) || NOISE_PHRASES.some(re => re.test(normalized));
  }

  function cleanQuery(term) {
    let value = String(term || '')
      .toLowerCase()
      .replace(/history[_ ]and[_ ]criticism/gi, ' ')
      .replace(/literature[_ ]history(?:[_ ]and[_ ]criticism)?/gi, ' ')
      .replace(/literary[_ ]criticism/gi, ' ')
      .replace(/criticism[_ ]textual/gi, ' ')
      .replace(/fictional[_ ]works(?:[_ ]by[_ ]one[_ ]author)?/gi, ' ')
      .replace(/works[_ ]by[_ ]one[_ ]author/gi, ' ')
      .replace(/language[_ ]and[_ ]literature/gi, ' ')
      .replace(/\b(?:british|english|irish|american|canadian|australian|scottish|welsh|french|german|european)\b/gi, ' ')
      .replace(/\b(?:literature|literary|fiction|fictional|criticism|critic|textual|text|language|languages|history|century|twentieth|nineteenth|twentyfirst|authors?|works?)\b/gi, ' ')
      .replace(/\b(?:19|20|21)[0-9]{2}\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!value || GENRES.has(value)) {
      return value && GENRES.has(value) ? `cinematic ${value}` : 'cinematic ambient';
    }
    return value;
  }

  function repair() {
    if (typeof window.iTunesSearch === 'function' && !window.__readsoundSearchPatched) {
      const originalSearch = window.iTunesSearch;
      window.iTunesSearch = term => originalSearch(cleanQuery(term));
      window.__readsoundSearchPatched = true;
    }

    if (typeof window.buildSoundtrack === 'function' && !window.__readsoundBuildPatched) {
      const originalBuild = window.buildSoundtrack;
      window.buildSoundtrack = async book => {
        const result = await originalBuild(book);

        document.querySelectorAll('#mood-strip .mood').forEach(el => {
          if (isNoise(el.textContent)) el.remove();
        });

        document.querySelectorAll('#tracks .track-score').forEach(el => {
          const text = el.textContent || '';
          if (/theme:\s*(british|english|irish|american|canadian|australian|scottish|welsh|literature|literary|fiction|criticism|textual|history|century)/i.test(text)) {
            el.textContent = 'overall atmosphere';
          }
        });

        return result;
      };
      window.__readsoundBuildPatched = true;
    }
  }

  // app.js is deferred, so wait for the document before applying the compatibility layer.
  window.addEventListener('DOMContentLoaded', repair, { once: true });
  setTimeout(repair, 0);
})();
