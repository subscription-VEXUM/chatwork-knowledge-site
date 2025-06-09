// AIナレッジ共有サイト 検索機能

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
    }

    if (this.filteredPosts.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results"><h3>😅 該当する投稿が見つかりませんでした</h3><p>検索条件を変更してお試しください。</p></div>';
      return;
    }

    resultsContainer.innerHTML = this.filteredPosts
      .map(post => this.renderPostCard(post))
      .join('');
  }

  renderPostCard(post) {
    const tags = this.extractTags(post.tags);
    const postId = post.date + '-' + post.author;
    
    return '<div class="post-card" data-post-id="' + postId + '">' +
      '<div class="post-meta">' +
        '<span class="post-author">' + post.author + '</span>' +
        '<span class="post-date">' + post.date + '</span>' +
      '</div>' +
      '<div class="post-summary">' + post.summary + '</div>' +
      '<div class="post-tags">' +
        tags.map(tag => '<span class="tag">' + tag + '</span>').join('') +
      '</div>' +
      '<div class="post-actions">' +
        '<button onclick="knowledgeSearch.showFullMessage(\'' + post.date + '\', \'' + post.author + '\')" class="btn-secondary">' +
          '📄 全文表示' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  extractTags(tagString) {
    if (!tagString) return [];
    return tagString.match(/#[^\s#]+/g) || [];
  }

  showFullMessage(date, author) {
    const post = this.posts.find(p => p.date === date && p.author === author);
    if (!post) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-content">' +
      '<div class="modal-header">' +
        '<h3>' + post.author + ' - ' + post.date + '</h3>' +
        '<button onclick="this.closest(\'.modal-overlay\').remove()" class="close-btn">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<h4>📋 要約</h4>' +
        '<p>' + post.summary + '</p>' +
        '<h4>📝 元メッセージ</h4>' +
        '<div class="original-message">' + post.message.replace(/\n/g, '<br>') + '</div>' +
        '<h4>🏷️ タグ</h4>' +
        '<div class="post-tags">' +
          this.extractTags(post.tags).map(tag => '<span class="tag">' + tag + '</span>').join('') +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  initializeFilters() {
    const allTags = [...new Set(this.posts.flatMap(post => this.extractTags(post.tags)))];
    const allAuthors = [...new Set(this.posts.map(post => post.author))];

    const tagFilter = document.getElementById('tagFilter');
    const authorFilter = document.getElementById('authorFilter');

    if (tagFilter) {
      tagFilter.innerHTML = '<option value="">すべてのタグ</option>' +
        allTags.map(tag => '<option value="' + tag + '">' + tag + '</option>').join('');
    }

    if (authorFilter) {
      authorFilter.innerHTML = '<option value="">すべての投稿者</option>' +
        allAuthors.map(author => '<option value="' + author + '">' + author + '</option>').join('');
    }
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

if (!document.querySelector('#modal-styles')) {
  const modalStyles = document.createElement('style');
  modalStyles.id = 'modal-styles';
  modalStyles.textContent = '.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; } .modal-content { background: white; border-radius: 12px; max-width: 800px; max-height: 80vh; overflow-y: auto; margin: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); } .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; } .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 6px; } .close-btn:hover { background: #f1f5f9; } .modal-body { padding: 1.5rem; } .original-message { background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color); white-space: pre-wrap; font-family: monospace; font-size: 0.9rem; } .post-actions { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; } .btn-secondary { background: #f1f5f9; color: var(--text-color); border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; } .btn-secondary:hover { background: #e2e8f0; } .no-results { text-align: center; padding: 3rem 1rem; color: #64748b; }';
  document.head.appendChild(modalStyles);
}