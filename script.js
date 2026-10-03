// Academic Search Tool - Client-side only
// Uses OpenAlex API for scholarly metadata, constructs Sci-Hub links when DOI available

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchQuery = document.getElementById('search-query');
    const resultsContainer = document.getElementById('results-container');
    const searchStatus = document.getElementById('search-status');
    const useScihubCheckbox = document.getElementById('use-scihub');
    
    // Boolean operator buttons
    const operatorButtons = document.querySelectorAll('.operator-btn');
    
    // Track active operator
    let activeOperator = '';
    
    // Set up operator button clicks
    operatorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            operatorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set active operator
            activeOperator = this.getAttribute('data-operator');
            
            // Insert operator at cursor position in search input
            if (activeOperator) {
                insertAtCursor(searchQuery, ` ${activeOperator} `);
            } else {
                // If no operator (empty button), just focus the input without inserting
                searchQuery.focus();
            }
        });
    });
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Handle Enter key in search input
    searchQuery.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    function insertAtCursor(input, text) {
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        
        // Set textarea value to: text before cursor + text to insert + text after cursor
        input.value = input.value.substring(0, startPos) + text + input.value.substring(endPos);
        
        // Set cursor position after the inserted text
        input.selectionStart = input.selectionEnd = startPos + text.length;
        
        // Focus the input
        input.focus();
    }
    
    async function performSearch() {
        const query = searchQuery.value.trim();
        if (!query) {
            showStatus('Por favor, digite uma pesquisa', 'error');
            return;
        }
        
        const useScihub = useScihubCheckbox.checked;
        
        showStatus('Buscando...', 'loading');
        
        try {
            // Call OpenAlex API (CORS enabled)
            const response = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            displayResults(data, useScihub);
        } catch (error) {
            console.error('Search error:', error);
            showStatus('Erro na busca. Verifique sua conexão ou tente novamente mais tarde.', 'error');
        }
    }
    
    function showStatus(message, type) {
        searchStatus.textContent = message;
        searchStatus.className = `search-status ${type}`;
    }
    
    function displayResults(data, useScihub) {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        const works = data.results || [];
        if (works.length === 0) {
            showStatus('Nenhum resultado encontrado.', 'info');
            return;
        }
        
        showStatus(`Encontrados ${works.length} resultados para "${searchQuery.value}"`, 'success');
        
        // Create results container
        const resultsList = document.createElement('div');
        resultsList.className = 'results-list';
        
        works.forEach(work => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            // Title
            const titleElement = document.createElement('h3');
            titleElement.className = 'result-title';
            titleElement.textContent = work.display_name || 'Sem título';
            resultItem.appendChild(titleElement);
            
            // Authors
            const authorships = work.authorships || [];
            const authorNames = authorships
                .map(a => a.author ? a.author.display_name : null)
                .filter(name => name);
            if (authorNames.length > 0) {
                const authorsElement = document.createElement('p');
                authorsElement.className = 'result-authors';
                authorsElement.textContent = `Autores: ${authorNames.join(', ')}`;
                resultItem.appendChild(authorsElement);
            }
            
            // Venue/Source
            const hostVenue = work.host_venue;
            if (hostVenue && hostVenue.display_name) {
                const venueElement = document.createElement('p');
                venueElement.className = 'result-venue';
                venueElement.textContent = `Fonte: ${hostVenue.display_name}`;
                resultItem.appendChild(venueElement);
            }
            
            // Abstract/Snippet (OpenAlex provides abstract_inverted_index)
            let abstract = '';
            const inverted = work.abstract_inverted_index;
            if (inverted) {
                // Reconstruct abstract from inverted index
                const positionWordPairs = [];
                for (const [word, positions] of Object.entries(inverted)) {
                    for (const pos of positions) {
                        positionWordPairs.push([pos, word]);
                    }
                }
                positionWordPairs.sort((a, b) => a[0] - b[0]);
                abstract = positionWordPairs.map(pair => pair[1]).join(' ');
            }
            const abstractElement = document.createElement('p');
            abstractElement.className = 'result-abstract';
            abstractElement.textContent = abstract || 'Resumo não disponível';
            resultItem.appendChild(abstractElement);
            
            // Links
            const linksElement = document.createElement('div');
            linksElement.className = 'result-links';
            
            // OpenAlex link (landing page)
            if (work.id) {
                const openAlexLink = document.createElement('a');
                openAlexLink.href = work.id; // OpenAlex IDs are URLs like https://openalex.org/Wxxxxxx
                openAlexLink.target = '_blank';
                openAlexLink.rel = 'noopener';
                openAlexLink.className = 'result-link';
                openAlexLink.textContent = 'Ver no OpenAlex';
                linksElement.appendChild(openAlexLink);
            }
            
            // DOI link (publisher)
            const doi = work.doi;
            if (doi) {
                // Extract DOI identifier (remove http://doi.org/ or https://doi.org/ prefix if present)
                const doiId = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
                const doiLink = document.createElement('a');
                doiLink.href = `https://doi.org/${doiId}`;
                doiLink.target = '_blank';
                doiLink.rel = 'noopener';
                doiLink.className = 'result-link';
                doiLink.textContent = 'Abrir versão oficial';
                linksElement.appendChild(doiLink);
            }
            
            // Sci-Hub link (if enabled and DOI exists)
            if (useScihub && doi) {
                // Extract DOI identifier (remove http://doi.org/ or https://doi.org/ prefix if present)
                const doiId = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
                const scihubLink = document.createElement('a');
                scihubLink.href = `https://www.sci-hub.in/${doiId}`;
                scihubLink.target = '_blank';
                scihubLink.rel = 'noopener';
                scihubLink.className = 'result-link secondary';
                scihubLink.textContent = 'Acessar via Sci-Hub';
                linksElement.appendChild(scihubLink);
            }
            
            resultItem.appendChild(linksElement);
            resultsList.appendChild(resultItem);
        });
        
        resultsContainer.appendChild(resultsList);
    }
    
    // Initialize with empty state
    showStatus('Digite sua pesquisa e pressione Buscar', 'info');
});