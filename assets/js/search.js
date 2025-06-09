// ChatWorkライク AIナレッジ共有サイト 検索機能

class KnowledgeSearch {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.init();
  }

  async init() {
    try {
      const response = await fetch('/chatwork-knowledge-site/assets/data/posts.json');
      this.posts = await response.json();
      this.filteredPosts = this.posts;
      this.setupEventListeners();
      this.renderResults();
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  }

  setupEventListeners() {
    const searchBox = document.getElementById('searchBox');
    const tagFilter = document.getElementById('tagFilter');
    const authorFilter = document.getElementById('authorFilter');

    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
    }

    if (tagFilter) {
      tagFilter.addEventListener('change', (e) => {
        this.filterByTag(e.target.value);
      });
    }

    if (authorFilter) {
      authorFilter.addEventListener('change', (e) => {
        this.filterByAuthor(e.target.value);
      });
    }
  }

  search(query) {
    if (!query.trim()) {
      this.filteredPosts = this.posts;
    } else {
      const searchTerms = query.toLowerCase().split(' ');
      this.filteredPosts = this.posts.filter(post => {
        const searchableText = (post.summary + ' ' + post.tags + ' ' + post.author + ' ' + post.message).toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    this.renderResults();
  }

  filterByTag(tag) {
    if (!tag) {
      this.filteredPosts = this.posts;
    } else {
      this.filteredPosts = this.posts.filter(post => 
        post.tags.includes(tag)
      );
    }
    this.renderResults();
  }

  filterByAuthor(author) {
    if (!author) {
      this.filteredPosts = this.posts;
    } else {
      this.filteredPosts = this.posts.filter(post => 
        post.author === author
      );
    }
    this.renderResults();
  }

  renderResults() {
    const resultsContainer = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');

    if (!resultsContainer) return;

    if (resultCount) {
      resultCount.textContent = this.filteredPosts.length + '件の投稿';
      resultCount.style.color = '#00C300';
      resultCount.style.fontWeight = '600';
    }

    if (this.filteredPosts.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results"><h3>😅 該当する投稿が見つかりませんでした</h3><p>検索条件を変更してお試しください。</p></div>';
      return;
    }

    resultsContainer.innerHTML = this.filteredPosts
      .map(post => this.renderChatWorkPostCard(post))
      .join('');
  }

  renderChatWorkPostCard(post) {
    const tags = this.extractTags(post.tags);
    const linkedMessage = this.convertUrlsToLinks(post.message);
    const isLongMessage = post.message.length > 300;
    const shortMessage = isLongMessage ? post.message.substring(0, 300) + '...' : post.message;
    const cardId = 'card-' + post.date + '-' + post.author.replace(/\s+/g, '');
    
    return '<div class="post-card">' +
      '<div class="post-header">' +
        '<span class="post-author">👤 ' + post.author + '</span>' +
        '<span class="post-date">📅 ' + post.date + '</span>' +
      '</div>' +
      '<div class="post-content">' +
        '<div class="post-summary">📝 ' + post.summary + '</div>' +
        '<div class="post-original ' + (isLongMessage ? '' : 'post-original-expanded') + '" id="' + cardId + '">' +
          this.convertUrlsToLinks(shortMessage) +
        '</div>' +
        (isLongMessage ? '<button class="expand-btn" onclick="toggleExpand(\'' + cardId + '\', \'' + this.escapeForJs(linkedMessage) + '\')">📖 全文を表示</button>' : '') +
        '<div class="post-tags">' +
          tags.map(tag => '<span class="tag">' + tag + '</span>').join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  convertUrlsToLinks(text) {
    if (!text) return '';
    const urlPattern = /(https?:\/\/[^\s\n\r]+)/g;
    return text.replace(urlPattern, '<a href="$1" target="_blank" class="auto-link">$1</a>');
  }

  escapeForJs(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  extractTags(tagString) {
    if (!tagString) return [];
    return tagString.match(/#[^\s#]+/g) || [];
  }

  initializeFilters() {
    const allTags = [...new Set(this.posts.flatMap(post => this.extractTags(post.tags)))];
    const allAuthors = [...new Set(this.posts.map(post => post.author))];

    const tagFilter = document.getElementById('tagFilter');
    const authorFilter = document.getElementById('authorFilter');

    if (tagFilter) {
      tagFilter.innerHTML = '<option value="">🏷️ すべてのタグ</option>' +
        allTags.map(tag => '<option value="' + tag + '">' + tag + '</option>').join('');
    }

    if (authorFilter) {
      authorFilter.innerHTML = '<option value="">👤 すべての投稿者</option>' +
        allAuthors.map(author => '<option value="' + author + '">' + author + '</option>').join('');
    }
  }
}

// 投稿展開/収縮機能
function toggleExpand(elementId, fullText) {
  const element = document.getElementById(elementId);
  const button = element.nextElementSibling;
  
  if (element.classList.contains('post-original-expanded')) {
    // 収縮
    const shortText = fullText.length > 300 ? fullText.substring(0, 300) + '...' : fullText;
    element.innerHTML = knowledgeSearch.convertUrlsToLinks(shortText);
    element.classList.remove('post-original-expanded');
    button.innerHTML = '📖 全文を表示';
  } else {
    // 展開
    element.innerHTML = knowledgeSearch.convertUrlsToLinks(fullText);
    element.classList.add('post-original-expanded');
    button.innerHTML = '📄 短縮表示';
  }
}

let knowledgeSearch;

document.addEventListener('DOMContentLoaded', () => {
  knowledgeSearch = new KnowledgeSearch();
  
  setTimeout(() => {
    if (knowledgeSearch.posts.length > 0) {
      knowledgeSearch.initializeFilters();
    }
  }, 500);
});